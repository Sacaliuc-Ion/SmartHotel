using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
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

        var dtos = rooms.Select(MapToDto).ToList();
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

        return ServiceResult<RoomDto>.Ok(MapToDto(room));
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

    private static RoomDto MapToDto(Domain.Entities.Room room)
    {
        return new RoomDto
        {
            Id = room.Id,
            Number = room.Number,
            Type = room.RoomType.Name,
            Floor = room.Floor,
            Capacity = room.Capacity,
            PricePerNight = room.PricePerNight,
            Status = room.Status.ToString().ToLower(),
            Description = room.Description,
            Amenities = room.RoomAmenities.Select(ra => ra.Amenity.Name).ToList()
        };
    }
}
