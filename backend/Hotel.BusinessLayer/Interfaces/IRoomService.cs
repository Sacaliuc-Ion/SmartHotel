namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Rooms;

public interface IRoomService
{
     Task<ServiceResult<List<RoomDto>>> GetAllRoomsAsync();
     Task<ServiceResult<RoomDto>> GetRoomByIdAsync(int id);
     Task<ServiceResult> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request);
}
