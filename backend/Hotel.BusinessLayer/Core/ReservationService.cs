using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Reservations;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class ReservationService : IReservationService
{
    private readonly DbSession _db;
    private static readonly string[] StaffRoles = ["Admin", "Reception", "Manager"];
    private const string CheckInTimeMarkerPrefix = "[checkin-time:";
    private static readonly TimeSpan DefaultCheckInTime = new(14, 0, 0);
    private static readonly TimeSpan CheckInSelectionWindow = TimeSpan.FromHours(3);

    public ReservationService(DbSession db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<ReservationDto>>> GetAllReservationsAsync()
    {
        var res = await _db.Context.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .Include(r => r.Review)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
    }

    public async Task<ServiceResult<List<ReservationDto>>> GetMyReservationsAsync(int userId)
    {
        var res = await _db.Context.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .Include(r => r.Review)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
    }

    public async Task<ServiceResult<ReservationDto>> CreateReservationAsync(CreateReservationRequest request, int userId)
    {
        var validation = await ValidateReservationRequestAsync(
            request.RoomId,
            request.CheckIn,
            request.CheckOut,
            request.CheckInTime,
            request.Guests,
            ReservationStatus.Confirmed
        );

        if (!validation.Success)
            return ServiceResult<ReservationDto>.Fail(validation.Message);

        var reservation = new ReservationData
        {
            UserId = userId,
            RoomId = request.RoomId,
            CheckInDate = validation.CheckInDate,
            CheckOutDate = validation.CheckOutDate,
            TotalPrice = validation.Room.PricePerNight * validation.Nights,
            Status = ReservationStatus.Confirmed,
            PaymentStatus = PaymentStatus.Unpaid,
            Guests = request.Guests,
            Notes = MergeReservationNotes(null, validation.CheckInTime, null)
        };

        _db.Context.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        _db.Context.UserNotifications.Add(new UserNotificationData
        {
            UserId = userId,
            ReservationId = reservation.Id,
            Title = "Rezervare confirmata",
            Message = $"Rezervarea pentru camera {validation.Room.Number} a fost confirmata pentru perioada {validation.CheckInDate:yyyy-MM-dd} - {validation.CheckOutDate:yyyy-MM-dd}."
        });
        await _db.SaveChangesAsync();

        var created = await _db.Context.Reservations.Include(r => r.User).Include(r => r.Room).FirstAsync(r => r.Id == reservation.Id);
        return ServiceResult<ReservationDto>.Ok(MapToDto(created));
    }

    public async Task<ServiceResult<ReservationDto>> UpdateReservationAsync(int reservationId, UpdateReservationRequest request, int actorUserId)
    {
        var reservation = await _db.Context.Reservations
            .Include(existingReservation => existingReservation.User)
            .Include(existingReservation => existingReservation.Room)
            .FirstOrDefaultAsync(existingReservation => existingReservation.Id == reservationId);

        if (reservation == null)
            return ServiceResult<ReservationDto>.Fail("Reservation not found.");

        if (reservation.Status == ReservationStatus.CheckedOut)
            return ServiceResult<ReservationDto>.Fail("Checked-out reservations can no longer be modified.");

        if (reservation.Status == ReservationStatus.Cancelled)
            return ServiceResult<ReservationDto>.Fail("Cancelled reservations can no longer be modified.");

        var targetStatus = ParseReservationStatus(request.Status, reservation.Status);
        if (targetStatus == null)
            return ServiceResult<ReservationDto>.Fail("The selected reservation status is not supported.");

        var targetPaymentStatus = ParsePaymentStatus(request.PaymentStatus, reservation.PaymentStatus);
        if (targetPaymentStatus == null)
            return ServiceResult<ReservationDto>.Fail("The selected payment status is not supported.");

        if (reservation.Status == ReservationStatus.CheckedIn && targetStatus != ReservationStatus.CheckedIn)
            return ServiceResult<ReservationDto>.Fail("Checked-in reservations must be completed through the dedicated front desk actions.");

        if (reservation.Status == ReservationStatus.CheckedIn && request.CheckIn != reservation.CheckInDate.ToString("yyyy-MM-dd"))
            return ServiceResult<ReservationDto>.Fail("The arrival date cannot be changed after the guest has checked in.");

        var validation = await ValidateReservationRequestAsync(
            request.RoomId,
            request.CheckIn,
            request.CheckOut,
            request.CheckInTime,
            request.Guests,
            targetStatus.Value,
            reservation.Id,
            reservation.Status,
            reservation.CheckInDate,
            ExtractCheckInTime(reservation.Notes)
        );

        if (!validation.Success)
            return ServiceResult<ReservationDto>.Fail(validation.Message);

        var originalRoomId = reservation.RoomId;
        var originalStatus = reservation.Status;
        var originalRoomNumber = reservation.Room.Number;
        var roomChanged = originalRoomId != validation.Room.Id;

        reservation.RoomId = validation.Room.Id;
        reservation.CheckInDate = validation.CheckInDate;
        reservation.CheckOutDate = validation.CheckOutDate;
        reservation.Guests = request.Guests;
        reservation.Status = targetStatus.Value;
        reservation.PaymentStatus = targetPaymentStatus.Value;
        reservation.Notes = MergeReservationNotes(request.Notes, validation.CheckInTime, reservation.Notes);
        reservation.TotalPrice = validation.Room.PricePerNight * validation.Nights;

        if (roomChanged && originalStatus == ReservationStatus.CheckedIn)
        {
            var previousRoom = await _db.Context.Rooms.FirstOrDefaultAsync(room => room.Id == originalRoomId);
            if (previousRoom != null)
            {
                previousRoom.Status = RoomStatus.Dirty;
            }

            validation.Room.Status = RoomStatus.Occupied;
        }

        await _db.SaveChangesAsync();

        if (roomChanged)
        {
            await RoomStatusSyncHelper.SyncAsync(_db.Context, originalRoomId);
        }

        await RoomStatusSyncHelper.SyncAsync(_db.Context, reservation.RoomId);

        await AddReservationUpdateNotificationAsync(reservation, validation.Room.Number, originalRoomNumber, originalStatus, actorUserId);
        await _db.SaveChangesAsync();

        var updated = await _db.Context.Reservations
            .Include(existingReservation => existingReservation.User)
            .Include(existingReservation => existingReservation.Room)
            .Include(existingReservation => existingReservation.Review)
            .FirstAsync(existingReservation => existingReservation.Id == reservationId);

        return ServiceResult<ReservationDto>.Ok(MapToDto(updated));
    }

    public async Task<ServiceResult<ReservationDto>> UpdateReservationPaymentStatusAsync(int reservationId, string paymentStatus, int actorUserId)
    {
        var reservation = await _db.Context.Reservations
            .Include(existingReservation => existingReservation.User)
            .Include(existingReservation => existingReservation.Room)
            .Include(existingReservation => existingReservation.Review)
            .FirstOrDefaultAsync(existingReservation => existingReservation.Id == reservationId);

        if (reservation == null)
            return ServiceResult<ReservationDto>.Fail("Reservation not found.");

        if (reservation.Status == ReservationStatus.CheckedOut)
            return ServiceResult<ReservationDto>.Fail("Checked-out reservations can no longer be modified.");

        if (reservation.Status == ReservationStatus.Cancelled)
            return ServiceResult<ReservationDto>.Fail("Cancelled reservations can no longer be modified.");

        var targetPaymentStatus = ParsePaymentStatus(paymentStatus, reservation.PaymentStatus);
        if (targetPaymentStatus == null)
            return ServiceResult<ReservationDto>.Fail("The selected payment status is not supported.");

        reservation.PaymentStatus = targetPaymentStatus.Value;
        await _db.SaveChangesAsync();

        return ServiceResult<ReservationDto>.Ok(MapToDto(reservation));
    }

    public async Task<ServiceResult> CancelReservationAsync(int reservationId, int userId, bool isAdminOrReception)
    {
        var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
        if (res == null) return ServiceResult.Fail("Reservation not found");

        if (!isAdminOrReception && res.UserId != userId)
            return ServiceResult.Fail("Unauthorized to cancel this reservation");

        if (res.Status == ReservationStatus.Cancelled)
            return ServiceResult.Fail("This reservation is already cancelled.");

        if (res.Status == ReservationStatus.NoShow)
            return ServiceResult.Fail("No-show reservations can no longer be cancelled.");

        if (res.Status == ReservationStatus.CheckedIn)
            return ServiceResult.Fail("Checked-in reservations must be checked out from the front desk.");

        if (res.Status == ReservationStatus.CheckedOut)
            return ServiceResult.Fail("Checked-out reservations can no longer be cancelled.");

        res.Status = ReservationStatus.Cancelled;
        await _db.SaveChangesAsync();
        await RoomStatusSyncHelper.SyncAsync(_db.Context, res.RoomId);

        _db.Context.UserNotifications.Add(new UserNotificationData
        {
            UserId = res.UserId,
            ReservationId = res.Id,
            Title = "Rezervare anulata",
            Message = $"Rezervarea pentru camera {res.Room.Number} a fost anulata."
        });

        await _db.SaveChangesAsync();

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult<RoomReviewDto>> AddReviewAsync(int reservationId, int userId, CreateRoomReviewRequest request)
    {
        if (request.Rating is < 1 or > 5)
            return ServiceResult<RoomReviewDto>.Fail("Rating must be between 1 and 5.");

        var reservation = await _db.Context.Reservations
            .Include(r => r.Review)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (reservation == null)
            return ServiceResult<RoomReviewDto>.Fail("Reservation not found.");

        if (reservation.UserId != userId)
            return ServiceResult<RoomReviewDto>.Fail("Unauthorized to review this reservation.");

        if (reservation.Status != ReservationStatus.CheckedOut)
            return ServiceResult<RoomReviewDto>.Fail("You can add a review only after checkout.");

        if (reservation.Review != null)
            return ServiceResult<RoomReviewDto>.Fail("A review already exists for this reservation.");

        var review = new RoomReviewData
        {
            ReservationId = reservation.Id,
            RoomId = reservation.RoomId,
            UserId = userId,
            Rating = request.Rating,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
        };

        _db.Context.RoomReviews.Add(review);
        await _db.SaveChangesAsync();

        return ServiceResult<RoomReviewDto>.Ok(MapToReviewDto(review));
    }

    public async Task<ServiceResult<ReviewSummaryDto>> GetReviewSummaryAsync()
    {
        var reviews = await _db.Context.RoomReviews.ToListAsync();
        var averageRating = reviews.Count == 0 ? 0 : Math.Round(reviews.Average(review => review.Rating), 1);

        return ServiceResult<ReviewSummaryDto>.Ok(new ReviewSummaryDto
        {
            AverageRating = averageRating,
            TotalReviews = reviews.Count
        });
    }

    public async Task<ServiceResult<GymAccessDto>> GetGymAccessAsync(int? userId)
    {
        if (!userId.HasValue)
        {
            return ServiceResult<GymAccessDto>.Ok(new GymAccessDto
            {
                IsAuthenticated = false,
                HasAccess = false,
                HasUpcomingReservation = false
            });
        }

        var today = DateOnly.FromDateTime(DateTime.Now);
        var reservations = await _db.Context.Reservations
            .Include(r => r.Room)
            .Where(r =>
                r.UserId == userId.Value &&
                r.Status != ReservationStatus.Cancelled &&
                r.Status != ReservationStatus.CheckedOut &&
                r.Status != ReservationStatus.NoShow)
            .OrderBy(r => r.CheckInDate)
            .ToListAsync();

        var activeReservation = reservations.FirstOrDefault(r =>
            r.Status == ReservationStatus.CheckedIn &&
            r.CheckInDate <= today &&
            today < r.CheckOutDate);

        if (activeReservation != null)
        {
            return ServiceResult<GymAccessDto>.Ok(new GymAccessDto
            {
                IsAuthenticated = true,
                HasAccess = true,
                HasUpcomingReservation = false,
                ReservationId = activeReservation.Id,
                RoomNumber = activeReservation.Room.Number,
                CheckIn = activeReservation.CheckInDate.ToString("yyyy-MM-dd"),
                CheckOut = activeReservation.CheckOutDate.ToString("yyyy-MM-dd")
            });
        }

        var upcomingReservation = reservations.FirstOrDefault(r =>
            r.Status == ReservationStatus.Confirmed &&
            r.CheckOutDate > today);

        return ServiceResult<GymAccessDto>.Ok(new GymAccessDto
        {
            IsAuthenticated = true,
            HasAccess = false,
            HasUpcomingReservation = upcomingReservation != null,
            ReservationId = upcomingReservation?.Id,
            RoomNumber = upcomingReservation?.Room.Number,
            CheckIn = upcomingReservation?.CheckInDate.ToString("yyyy-MM-dd"),
            CheckOut = upcomingReservation?.CheckOutDate.ToString("yyyy-MM-dd")
        });
    }

    private static ReservationDto MapToDto(ReservationData r) => new()
    {
        Id = r.Id,
        GuestName = $"{r.User.FirstName} {r.User.LastName}",
        RoomId = r.RoomId,
        RoomNumber = r.Room.Number,
        CheckIn = r.CheckInDate.ToString("yyyy-MM-dd"),
        CheckOut = r.CheckOutDate.ToString("yyyy-MM-dd"),
        CheckInTime = ExtractCheckInTime(r.Notes) ?? "14:00",
        Status = ClientValueFormatter.ToClientValue(r.Status),
        PaymentStatus = ClientValueFormatter.ToClientValue(r.PaymentStatus),
        TotalAmount = r.TotalPrice,
        Guests = r.Guests,
        Notes = StripCheckInTimeMarker(r.Notes),
        Review = r.Review == null ? null : MapToReviewDto(r.Review)
    };

    private static RoomReviewDto MapToReviewDto(RoomReviewData review) => new()
    {
        Id = review.Id,
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
    };

    private async Task<ReservationValidationResult> ValidateReservationRequestAsync(
        int roomId,
        string checkInValue,
        string checkOutValue,
        string? checkInTimeValue,
        int guests,
        ReservationStatus targetStatus,
        int? reservationIdToIgnore = null,
        ReservationStatus? currentStatus = null,
        DateOnly? currentCheckInDate = null,
        string? existingCheckInTime = null)
    {
        var room = await _db.Context.Rooms.FirstOrDefaultAsync(existingRoom => existingRoom.Id == roomId);
        if (room == null || !room.IsActive)
            return ReservationValidationResult.Fail("The selected room could not be found.");

        var isNonBlockingStatus = targetStatus is ReservationStatus.Cancelled or ReservationStatus.NoShow;

        if (!isNonBlockingStatus && room.Status is RoomStatus.OutOfOrder or RoomStatus.OutOfService)
            return ReservationValidationResult.Fail("The selected room is currently unavailable for reservations.");

        if (!DateOnly.TryParse(checkInValue, out var checkIn) || !DateOnly.TryParse(checkOutValue, out var checkOut))
            return ReservationValidationResult.Fail("Please use the YYYY-MM-DD format for arrival and departure dates.");

        var allowedCheckInWindow = await GetCheckInWindowAsync();
        if (!TryResolveCheckInTime(checkInTimeValue, existingCheckInTime, allowedCheckInWindow, out var selectedCheckInTime))
            return ReservationValidationResult.Fail($"Check-in time must be between {allowedCheckInWindow.Start:hh\\:mm} and {allowedCheckInWindow.End:hh\\:mm}.");

        var today = DateOnly.FromDateTime(DateTime.Now);
        if (currentStatus != ReservationStatus.CheckedIn && targetStatus != ReservationStatus.NoShow && checkIn < today)
            return ReservationValidationResult.Fail("Reservations can only be created or updated for today or a future arrival date.");

        if (currentStatus != ReservationStatus.CheckedIn && checkIn == today)
        {
            var currentLocalTime = DateTime.Now.TimeOfDay;
            if (selectedCheckInTime <= currentLocalTime)
                return ReservationValidationResult.Fail("For today's arrival, please choose a check-in time later than the current time.");
        }

        var nights = checkOut.DayNumber - checkIn.DayNumber;
        if (nights <= 0)
            return ReservationValidationResult.Fail("The departure date must be after the arrival date.");

        if (guests < 1)
            return ReservationValidationResult.Fail("At least one guest must be assigned to the reservation.");

        if (guests > room.Capacity)
            return ReservationValidationResult.Fail($"Room {room.Number} can accommodate up to {room.Capacity} guests.");

        if (currentStatus == ReservationStatus.CheckedIn && currentCheckInDate.HasValue && checkIn != currentCheckInDate.Value)
            return ReservationValidationResult.Fail("The arrival date cannot be changed once the stay has started.");

        if (targetStatus == ReservationStatus.NoShow && checkIn > today)
            return ReservationValidationResult.Fail("A reservation can be marked as no-show only on or after its arrival date.");

        if (targetStatus == ReservationStatus.CheckedOut)
            return ReservationValidationResult.Fail("Checked-out status can only be applied from the dedicated check-out flow.");

        if (!isNonBlockingStatus)
        {
            var hasOverlap = await _db.Context.Reservations.AnyAsync(reservation =>
                reservation.Id != reservationIdToIgnore &&
                reservation.RoomId == roomId &&
                reservation.Status != ReservationStatus.Cancelled &&
                reservation.Status != ReservationStatus.CheckedOut &&
                reservation.Status != ReservationStatus.NoShow &&
                reservation.CheckInDate < checkOut &&
                checkIn < reservation.CheckOutDate
            );

            if (hasOverlap)
                return ReservationValidationResult.Fail("The selected room already has another active reservation for the chosen period.");
        }

        return ReservationValidationResult.Ok(room, checkIn, checkOut, selectedCheckInTime, nights);
    }

    private async Task<CheckInWindow> GetCheckInWindowAsync()
    {
        var checkInValue = await _db.Context.HotelSettings
            .Where(setting => setting.Key == "CheckInTime")
            .Select(setting => setting.Value)
            .FirstOrDefaultAsync();

        var start = TimeSpan.TryParse(checkInValue, out var parsed) ? parsed : DefaultCheckInTime;
        return new CheckInWindow
        {
            Start = start,
            End = start.Add(CheckInSelectionWindow),
        };
    }

    private static bool TryResolveCheckInTime(string? requestedCheckInTime, string? existingCheckInTime, CheckInWindow checkInWindow, out TimeSpan selectedCheckInTime)
    {
        if (TimeSpan.TryParse(requestedCheckInTime, out var parsedRequested))
        {
            if (parsedRequested < checkInWindow.Start || parsedRequested > checkInWindow.End)
            {
                selectedCheckInTime = default;
                return false;
            }

            selectedCheckInTime = parsedRequested;
            return true;
        }

        if (TimeSpan.TryParse(existingCheckInTime, out var parsedExisting))
        {
            selectedCheckInTime = parsedExisting;
            return true;
        }

        selectedCheckInTime = checkInWindow.Start;
        return true;
    }

    private static ReservationStatus? ParseReservationStatus(string? value, ReservationStatus fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
            return fallback;

        var normalized = value.Trim().Replace("-", string.Empty, StringComparison.OrdinalIgnoreCase);
        return Enum.TryParse<ReservationStatus>(normalized, true, out var parsed) ? parsed : null;
    }

    private static PaymentStatus? ParsePaymentStatus(string? value, PaymentStatus fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
            return fallback;

        var normalized = value.Trim().Replace("-", string.Empty, StringComparison.OrdinalIgnoreCase);
        return Enum.TryParse<PaymentStatus>(normalized, true, out var parsed) ? parsed : null;
    }

    private async Task AddReservationUpdateNotificationAsync(
        ReservationData reservation,
        string newRoomNumber,
        string previousRoomNumber,
        ReservationStatus previousStatus,
        int actorUserId)
    {
        var title = reservation.Status switch
        {
            ReservationStatus.Cancelled => "Rezervare anulata",
            ReservationStatus.NoShow => "Rezervare marcata ca neprezentare",
            _ => "Rezervare actualizata"
        };

        var message = reservation.Status switch
        {
            ReservationStatus.Cancelled => $"Rezervarea pentru camera {newRoomNumber} a fost anulata de echipa hotelului.",
            ReservationStatus.NoShow => $"Rezervarea pentru camera {newRoomNumber} a fost marcata ca neprezentare.",
            _ when previousRoomNumber != newRoomNumber =>
                $"Rezervarea a fost actualizata. Noul sejur este alocat camerei {newRoomNumber} pentru perioada {reservation.CheckInDate:yyyy-MM-dd} - {reservation.CheckOutDate:yyyy-MM-dd}.",
            _ =>
                $"Rezervarea pentru camera {newRoomNumber} a fost actualizata pentru perioada {reservation.CheckInDate:yyyy-MM-dd} - {reservation.CheckOutDate:yyyy-MM-dd}."
        };

        _db.Context.UserNotifications.Add(new UserNotificationData
        {
            UserId = reservation.UserId,
            ReservationId = reservation.Id,
            Title = title,
            Message = message
        });

        if (reservation.Status == ReservationStatus.NoShow)
        {
            var staffRecipients = await _db.Context.Users
                .Include(user => user.Role)
                .Where(user =>
                    user.IsActive &&
                    user.Id != actorUserId &&
                    StaffRoles.Contains(user.Role.Name))
                .Select(user => new UserNotificationData
                {
                    UserId = user.Id,
                    ReservationId = reservation.Id,
                    Title = "Rezervare marcata ca neprezentare",
                    Message = $"Rezervarea pentru camera {newRoomNumber} a fost marcata ca neprezentare."
                })
                .ToListAsync();

            if (staffRecipients.Count > 0)
            {
                _db.Context.UserNotifications.AddRange(staffRecipients);
            }
        }
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string? ExtractCheckInTime(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
            return null;

        var markerStart = notes.IndexOf(CheckInTimeMarkerPrefix, StringComparison.OrdinalIgnoreCase);
        if (markerStart < 0)
            return null;

        var valueStart = markerStart + CheckInTimeMarkerPrefix.Length;
        var markerEnd = notes.IndexOf(']', valueStart);
        if (markerEnd < 0)
            return null;

        var rawValue = notes[valueStart..markerEnd].Trim();
        return TimeSpan.TryParse(rawValue, out var parsed) ? parsed.ToString(@"hh\:mm") : null;
    }

    private static string? StripCheckInTimeMarker(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
            return null;

        var markerStart = notes.IndexOf(CheckInTimeMarkerPrefix, StringComparison.OrdinalIgnoreCase);
        if (markerStart < 0)
            return CleanOptional(notes);

        var markerEnd = notes.IndexOf(']', markerStart);
        if (markerEnd < 0)
            return CleanOptional(notes);

        var withoutMarker = string.Concat(notes[..markerStart], notes[(markerEnd + 1)..]).Trim();
        return CleanOptional(withoutMarker);
    }

    private static string? MergeReservationNotes(string? visibleNotes, TimeSpan selectedCheckInTime, string? existingNotes)
    {
        var sanitizedVisibleNotes = CleanOptional(visibleNotes) ?? StripCheckInTimeMarker(existingNotes);
        var marker = $"{CheckInTimeMarkerPrefix}{selectedCheckInTime:hh\\:mm}]";

        if (string.IsNullOrWhiteSpace(sanitizedVisibleNotes))
            return marker;

        return $"{marker} {sanitizedVisibleNotes}";
    }

    private sealed class ReservationValidationResult
    {
        public bool Success { get; private init; }
        public string Message { get; private init; } = string.Empty;
        public RoomData Room { get; private init; } = null!;
        public DateOnly CheckInDate { get; private init; }
        public DateOnly CheckOutDate { get; private init; }
        public TimeSpan CheckInTime { get; private init; }
        public int Nights { get; private init; }

        public static ReservationValidationResult Ok(RoomData room, DateOnly checkInDate, DateOnly checkOutDate, TimeSpan checkInTime, int nights) => new()
        {
            Success = true,
            Room = room,
            CheckInDate = checkInDate,
            CheckOutDate = checkOutDate,
            CheckInTime = checkInTime,
            Nights = nights
        };

        public static ReservationValidationResult Fail(string message) => new()
        {
            Success = false,
            Message = message
        };
    }

    private sealed class CheckInWindow
    {
        public TimeSpan Start { get; init; }
        public TimeSpan End { get; init; }
    }

}
