using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Rooms;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class RoomService : IRoomService
{
    private readonly DbSession _db;

    public RoomService(DbSession db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<RoomDto>>> GetAllRoomsAsync()
    {
        var rooms = await _db.Context.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .Where(r => r.IsActive)
            .ToListAsync();

        var nextAvailabilityByRoom = await GetNextAvailabilityByRoomAsync(rooms.Select(room => room.Id).ToList());
        var dtos = rooms.Select(room => MapToDto(room, nextAvailabilityByRoom.GetValueOrDefault(room.Id))).ToList();
        return ServiceResult<List<RoomDto>>.Ok(dtos);
    }

    public async Task<ServiceResult<RoomDto>> GetRoomByIdAsync(int id)
    {
        var room = await _db.Context.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);

        if (room == null)
            return ServiceResult<RoomDto>.Fail("Room not found.");

        var nextAvailabilityByRoom = await GetNextAvailabilityByRoomAsync(new List<int> { room.Id });
        return ServiceResult<RoomDto>.Ok(MapToDto(room, nextAvailabilityByRoom.GetValueOrDefault(room.Id)));
    }

    public async Task<ServiceResult> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request)
    {
        var room = await _db.Context.Rooms.FindAsync(roomId);
        if (room == null || !room.IsActive)
            return ServiceResult.Fail("Room not found");

        room.Status = request.Status;
        await _db.SaveChangesAsync();

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> UpdateRoomTypePriceAsync(string roomType, UpdateRoomPriceRequest request)
    {
        if (request.PricePerNight <= 0)
            return ServiceResult.Fail("Room price must be greater than zero");

        var normalizedRoomType = roomType.Trim().ToLower();
        var type = await _db.Context.RoomTypes
            .Include(roomTypeEntity => roomTypeEntity.Rooms)
            .FirstOrDefaultAsync(roomTypeEntity => roomTypeEntity.Name.ToLower() == normalizedRoomType);

        if (type == null)
            return ServiceResult.Fail("Room type not found");

        type.BasePrice = request.PricePerNight;

        foreach (var room in type.Rooms.Where(room => room.IsActive))
        {
            room.PricePerNight = request.PricePerNight;
        }

        await _db.SaveChangesAsync();

        return ServiceResult.Ok();
    }

    private async Task<Dictionary<int, DateOnly?>> GetNextAvailabilityByRoomAsync(List<int> roomIds)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var reservations = await _db.Context.Reservations
            .Where(reservation =>
                roomIds.Contains(reservation.RoomId) &&
                reservation.Status != ReservationStatus.Cancelled &&
                reservation.Status != ReservationStatus.CheckedOut &&
                reservation.Status != ReservationStatus.NoShow &&
                reservation.CheckOutDate >= today)
            .OrderBy(reservation => reservation.RoomId)
            .ThenBy(reservation => reservation.CheckInDate)
            .ToListAsync();

        return roomIds.ToDictionary(
            roomId => roomId,
            roomId => GetNextAvailableDate(
                reservations.Where(reservation => reservation.RoomId == roomId).ToList(),
                today
            )
        );
    }

    private static DateOnly? GetNextAvailableDate(List<Domain.Entities.Reservation> reservations, DateOnly today)
    {
        if (reservations.Count == 0)
            return null;

        var cursor = today;
        var blocked = false;

        foreach (var reservation in reservations)
        {
            if (reservation.CheckOutDate <= cursor)
                continue;

            if (reservation.CheckInDate <= cursor)
            {
                blocked = true;
                cursor = reservation.CheckOutDate > cursor ? reservation.CheckOutDate : cursor;
            }
        }

        return blocked ? cursor : null;
    }

    private static RoomDto MapToDto(Domain.Entities.Room room, DateOnly? nextAvailableDate)
    {
        return new RoomDto
        {
            Id = room.Id,
            Number = room.Number,
            Type = room.RoomType.Name,
            Floor = room.Floor,
            Capacity = room.Capacity,
            PricePerNight = room.PricePerNight,
            Status = ClientValueFormatter.ToClientValue(room.Status),
            Description = room.Description,
            Amenities = room.RoomAmenities.Select(ra => ra.Amenity.Name).ToList(),
            NextAvailableDate = nextAvailableDate?.ToString("yyyy-MM-dd")
        };
    }
}
