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
            request.Guests,
            ReservationStatus.Confirmed
        );

        if (!validation.Success)
            return ServiceResult<ReservationDto>.Fail(validation.Message);

        var reservation = new Reservation
        {
            UserId = userId,
            RoomId = request.RoomId,
            CheckInDate = validation.CheckInDate,
            CheckOutDate = validation.CheckOutDate,
            TotalPrice = validation.Room.PricePerNight * validation.Nights,
            Status = ReservationStatus.Confirmed,
            PaymentStatus = PaymentStatus.Unpaid,
            Guests = request.Guests
        };

        _db.Context.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        _db.Context.UserNotifications.Add(new UserNotification
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

        if (reservation.Status == ReservationStatus.CheckedIn && targetStatus != ReservationStatus.CheckedIn)
            return ServiceResult<ReservationDto>.Fail("Checked-in reservations must be completed through the dedicated front desk actions.");

        if (reservation.Status == ReservationStatus.CheckedIn && request.CheckIn != reservation.CheckInDate.ToString("yyyy-MM-dd"))
            return ServiceResult<ReservationDto>.Fail("The arrival date cannot be changed after the guest has checked in.");

        var validation = await ValidateReservationRequestAsync(
            request.RoomId,
            request.CheckIn,
            request.CheckOut,
            request.Guests,
            targetStatus.Value,
            reservation.Id,
            reservation.Status,
            reservation.CheckInDate
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
        reservation.Notes = CleanOptional(request.Notes);
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

        _db.Context.UserNotifications.Add(new UserNotification
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

        var review = new RoomReview
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

    private static ReservationDto MapToDto(Reservation r) => new()
    {
        Id = r.Id,
        GuestName = $"{r.User.FirstName} {r.User.LastName}",
        RoomId = r.RoomId,
        RoomNumber = r.Room.Number,
        CheckIn = r.CheckInDate.ToString("yyyy-MM-dd"),
        CheckOut = r.CheckOutDate.ToString("yyyy-MM-dd"),
        Status = ClientValueFormatter.ToClientValue(r.Status),
        PaymentStatus = ClientValueFormatter.ToClientValue(r.PaymentStatus),
        TotalAmount = r.TotalPrice,
        Guests = r.Guests,
        Notes = r.Notes,
        Review = r.Review == null ? null : MapToReviewDto(r.Review)
    };

    private static RoomReviewDto MapToReviewDto(RoomReview review) => new()
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
        int guests,
        ReservationStatus targetStatus,
        int? reservationIdToIgnore = null,
        ReservationStatus? currentStatus = null,
        DateOnly? currentCheckInDate = null)
    {
        var room = await _db.Context.Rooms.FirstOrDefaultAsync(existingRoom => existingRoom.Id == roomId);
        if (room == null || !room.IsActive)
            return ReservationValidationResult.Fail("The selected room could not be found.");

        var isNonBlockingStatus = targetStatus is ReservationStatus.Cancelled or ReservationStatus.NoShow;

        if (!isNonBlockingStatus && room.Status is RoomStatus.OutOfOrder or RoomStatus.OutOfService)
            return ReservationValidationResult.Fail("The selected room is currently unavailable for reservations.");

        if (!DateOnly.TryParse(checkInValue, out var checkIn) || !DateOnly.TryParse(checkOutValue, out var checkOut))
            return ReservationValidationResult.Fail("Please use the YYYY-MM-DD format for arrival and departure dates.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (currentStatus != ReservationStatus.CheckedIn && targetStatus != ReservationStatus.NoShow && checkIn < today)
            return ReservationValidationResult.Fail("Reservations can only be created or updated for today or a future arrival date.");

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

        return ReservationValidationResult.Ok(room, checkIn, checkOut, nights);
    }

    private static ReservationStatus? ParseReservationStatus(string? value, ReservationStatus fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
            return fallback;

        var normalized = value.Trim().Replace("-", string.Empty, StringComparison.OrdinalIgnoreCase);
        return Enum.TryParse<ReservationStatus>(normalized, true, out var parsed) ? parsed : null;
    }

    private async Task AddReservationUpdateNotificationAsync(
        Reservation reservation,
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

        _db.Context.UserNotifications.Add(new UserNotification
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
                .Select(user => new UserNotification
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

    private sealed class ReservationValidationResult
    {
        public bool Success { get; private init; }
        public string Message { get; private init; } = string.Empty;
        public Room Room { get; private init; } = null!;
        public DateOnly CheckInDate { get; private init; }
        public DateOnly CheckOutDate { get; private init; }
        public int Nights { get; private init; }

        public static ReservationValidationResult Ok(Room room, DateOnly checkInDate, DateOnly checkOutDate, int nights) => new()
        {
            Success = true,
            Room = room,
            CheckInDate = checkInDate,
            CheckOutDate = checkOutDate,
            Nights = nights
        };

        public static ReservationValidationResult Fail(string message) => new()
        {
            Success = false,
            Message = message
        };
    }
}
