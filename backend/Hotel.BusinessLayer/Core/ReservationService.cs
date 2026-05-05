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

    public ReservationService(DbSession db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<ReservationDto>>> GetAllReservationsAsync()
    {
        var res = await _db.Context.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
    }

    public async Task<ServiceResult<List<ReservationDto>>> GetMyReservationsAsync(int userId)
    {
        var res = await _db.Context.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
    }

    public async Task<ServiceResult<ReservationDto>> CreateReservationAsync(CreateReservationRequest request, int userId)
    {
        var room = await _db.Context.Rooms.FindAsync(request.RoomId);
        if (room == null || !room.IsActive || room.Status != RoomStatus.Available)
            return ServiceResult<ReservationDto>.Fail("Room is not available.");

        if (!DateOnly.TryParse(request.CheckIn, out var checkIn) || !DateOnly.TryParse(request.CheckOut, out var checkOut))
            return ServiceResult<ReservationDto>.Fail("Invalid date format. Use YYYY-MM-DD");

        var days = checkOut.DayNumber - checkIn.DayNumber;
        if (days <= 0)
            return ServiceResult<ReservationDto>.Fail("CheckOut must be after CheckIn");

        if (request.Guests < 1)
            return ServiceResult<ReservationDto>.Fail("At least one guest is required.");

        if (request.Guests > room.Capacity)
            return ServiceResult<ReservationDto>.Fail($"Room supports up to {room.Capacity} guests.");

        var hasOverlap = await _db.Context.Reservations.AnyAsync(reservation =>
            reservation.RoomId == request.RoomId &&
            reservation.Status != ReservationStatus.Cancelled &&
            reservation.Status != ReservationStatus.CheckedOut &&
            reservation.CheckInDate < checkOut &&
            checkIn < reservation.CheckOutDate
        );

        if (hasOverlap)
            return ServiceResult<ReservationDto>.Fail("Room already has an active reservation for the selected dates.");

        var reservation = new Reservation
        {
            UserId = userId,
            RoomId = request.RoomId,
            CheckInDate = checkIn,
            CheckOutDate = checkOut,
            TotalPrice = room.PricePerNight * days,
            Status = ReservationStatus.Confirmed,
            PaymentStatus = PaymentStatus.Unpaid,
            Guests = request.Guests
        };

        _db.Context.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        var created = await _db.Context.Reservations.Include(r => r.User).Include(r => r.Room).FirstAsync(r => r.Id == reservation.Id);
        return ServiceResult<ReservationDto>.Ok(MapToDto(created));
    }

    public async Task<ServiceResult> CancelReservationAsync(int reservationId, int userId, bool isAdminOrReception)
    {
        var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
        if (res == null) return ServiceResult.Fail("Reservation not found");

        if (!isAdminOrReception && res.UserId != userId)
            return ServiceResult.Fail("Unauthorized to cancel this reservation");

        res.Status = ReservationStatus.Cancelled;
        await _db.SaveChangesAsync();
        await RoomStatusSyncHelper.SyncAsync(_db.Context, res.RoomId);
        await _db.SaveChangesAsync();

        return ServiceResult.Ok();
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
        Guests = r.Guests
    };
}
