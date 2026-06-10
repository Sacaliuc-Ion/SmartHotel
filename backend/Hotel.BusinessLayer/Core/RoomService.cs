using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Rooms;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class RoomService : IRoomService
{
    private readonly DbSession _db;
    private static readonly string[] FrontDeskRoles = ["Admin", "Reception", "Manager"];
    private static readonly TimeSpan DefaultCheckInTime = new(14, 0, 0);
    private static readonly TimeSpan DefaultCheckOutTime = new(11, 0, 0);
    private static readonly TimeSpan CleaningBuffer = TimeSpan.FromHours(2);
    private static readonly TimeSpan CheckInSelectionWindow = TimeSpan.FromHours(3);

    public RoomService(DbSession db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<RoomDto>>> GetAllRoomsAsync()
    {
        await NormalizeOperationalRoomStatusesAsync();

        var rooms = await _db.Context.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .Where(r => r.IsActive)
            .ToListAsync();

        var timingSettings = await GetOperationalTimingSettingsAsync();
        var nextAvailabilityByRoom = await GetNextAvailabilityByRoomAsync(rooms.Select(room => room.Id).ToList(), timingSettings);
        var dtos = rooms.Select(room => MapToDto(room, nextAvailabilityByRoom.GetValueOrDefault(room.Id), timingSettings)).ToList();
        return ServiceResult<List<RoomDto>>.Ok(dtos);
    }

    public async Task<ServiceResult<RoomDto>> GetRoomByIdAsync(int id)
    {
        await NormalizeOperationalRoomStatusesAsync();

        var room = await _db.Context.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .FirstOrDefaultAsync(r => r.Id == id && r.IsActive);

        if (room == null)
            return ServiceResult<RoomDto>.Fail("Room not found.");

        var timingSettings = await GetOperationalTimingSettingsAsync();
        var nextAvailabilityByRoom = await GetNextAvailabilityByRoomAsync(new List<int> { room.Id }, timingSettings);
        return ServiceResult<RoomDto>.Ok(MapToDto(room, nextAvailabilityByRoom.GetValueOrDefault(room.Id), timingSettings));
    }

    public async Task<ServiceResult> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request)
    {
        var room = await _db.Context.Rooms.FindAsync(roomId);
        if (room == null || !room.IsActive)
            return ServiceResult.Fail("Room not found");

        var previousStatus = room.Status;
        room.Status = request.Status;
        await _db.SaveChangesAsync();

        if (previousStatus != request.Status && request.Status is RoomStatus.Ready or RoomStatus.Available)
        {
            await NotifyRoomReadyForCheckInAsync(room.Id, room.Number);
            await _db.SaveChangesAsync();
        }

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

    private async Task<Dictionary<int, AvailabilityInfo?>> GetNextAvailabilityByRoomAsync(List<int> roomIds, OperationalTimingSettings timingSettings)
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

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
            roomId => GetNextAvailability(
                reservations.Where(reservation => reservation.RoomId == roomId).ToList(),
                today,
                now,
                timingSettings
            )
        );
    }

    private static AvailabilityInfo? GetNextAvailability(
        List<Domain.Entities.ReservationData> reservations,
        DateOnly today,
        DateTime now,
        OperationalTimingSettings timingSettings)
    {
        if (reservations.Count == 0)
            return null;

        var cursor = today;
        var blocked = false;

        foreach (var reservation in reservations)
        {
            if (reservation.CheckOutDate < cursor)
                continue;

            if (reservation.CheckInDate < cursor && reservation.CheckOutDate == cursor)
            {
                blocked = true;
                continue;
            }

            if (reservation.CheckInDate <= cursor)
            {
                blocked = true;
                cursor = reservation.CheckOutDate > cursor ? reservation.CheckOutDate : cursor;
            }
        }

        if (!blocked)
            return null;

        var earliestCheckInTime = timingSettings.CheckInTime > timingSettings.CheckOutTime.Add(CleaningBuffer)
            ? timingSettings.CheckInTime
            : timingSettings.CheckOutTime.Add(CleaningBuffer);

        var nextAvailableAt = cursor.ToDateTime(TimeOnly.FromTimeSpan(earliestCheckInTime));

        if (nextAvailableAt <= now)
            return null;

        return new AvailabilityInfo
        {
            NextAvailableDate = cursor,
            NextAvailableAt = nextAvailableAt
        };
    }

    private static RoomDto MapToDto(Domain.Entities.RoomData room, AvailabilityInfo? availabilityInfo, OperationalTimingSettings timingSettings)
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
            NextAvailableDate = availabilityInfo?.NextAvailableDate.ToString("yyyy-MM-dd"),
            NextAvailableAt = availabilityInfo?.NextAvailableAt.ToString("yyyy-MM-ddTHH:mm:ss"),
            StandardCheckInTime = timingSettings.CheckInTime.ToString(@"hh\:mm"),
            LatestCheckInTime = timingSettings.CheckInTime.Add(CheckInSelectionWindow).ToString(@"hh\:mm"),
            StandardCheckOutTime = timingSettings.CheckOutTime.ToString(@"hh\:mm")
        };
    }

    private async Task<OperationalTimingSettings> GetOperationalTimingSettingsAsync()
    {
        var settings = await _db.Context.HotelSettings
            .Where(setting => setting.Key == "CheckInTime" || setting.Key == "CheckOutTime")
            .ToListAsync();

        var checkInValue = settings.FirstOrDefault(setting => setting.Key == "CheckInTime")?.Value;
        var checkOutValue = settings.FirstOrDefault(setting => setting.Key == "CheckOutTime")?.Value;

        return new OperationalTimingSettings
        {
            CheckInTime = TimeSpan.TryParse(checkInValue, out var parsedCheckIn) ? parsedCheckIn : DefaultCheckInTime,
            CheckOutTime = TimeSpan.TryParse(checkOutValue, out var parsedCheckOut) ? parsedCheckOut : DefaultCheckOutTime,
        };
    }

    private async Task NotifyRoomReadyForCheckInAsync(int roomId, string roomNumber)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var arrival = await _db.Context.Reservations
            .Include(reservation => reservation.User)
            .FirstOrDefaultAsync(reservation =>
                reservation.RoomId == roomId &&
                reservation.Status == ReservationStatus.Confirmed &&
                reservation.CheckInDate == today);

        if (arrival == null)
            return;

        var recipients = await _db.Context.Users
            .Include(user => user.Role)
            .Where(user => user.IsActive && FrontDeskRoles.Contains(user.Role.Name))
            .ToListAsync();

        if (recipients.Count == 0)
            return;

        foreach (var recipient in recipients)
        {
            var exists = await _db.Context.UserNotifications.AnyAsync(notification =>
                notification.UserId == recipient.Id &&
                notification.ReservationId == arrival.Id &&
                notification.Title == "Room ready for check-in");

            if (exists)
                continue;

            _db.Context.UserNotifications.Add(new UserNotificationData
            {
                UserId = recipient.Id,
                ReservationId = arrival.Id,
                Title = "Room ready for check-in",
                Message = $"Camera {roomNumber} este pregatita pentru sosirea de astazi a oaspetelui {arrival.User.FirstName} {arrival.User.LastName}."
            });
        }
    }

    private async Task NormalizeOperationalRoomStatusesAsync()
    {
        var rooms = await _db.Context.Rooms
            .Where(room => room.IsActive && room.Status != RoomStatus.OutOfOrder && room.Status != RoomStatus.OutOfService)
            .ToListAsync();

        if (rooms.Count == 0)
            return;

        var checkedInRoomIds = await _db.Context.Reservations
            .Where(reservation => reservation.Status == ReservationStatus.CheckedIn)
            .Select(reservation => reservation.RoomId)
            .Distinct()
            .ToListAsync();

        var changed = false;
        foreach (var room in rooms)
        {
            var shouldBeOccupied = checkedInRoomIds.Contains(room.Id);

            if (shouldBeOccupied && room.Status != RoomStatus.Occupied)
            {
                room.Status = RoomStatus.Occupied;
                changed = true;
            }
            else if (!shouldBeOccupied && room.Status == RoomStatus.Occupied)
            {
                room.Status = RoomStatus.Available;
                changed = true;
            }
        }

        if (changed)
        {
            await _db.SaveChangesAsync();
        }
    }

    private sealed class AvailabilityInfo
    {
        public DateOnly NextAvailableDate { get; init; }
        public DateTime NextAvailableAt { get; init; }
    }

    private sealed class OperationalTimingSettings
    {
        public TimeSpan CheckInTime { get; init; }
        public TimeSpan CheckOutTime { get; init; }
    }
}
