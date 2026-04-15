using Hotel.Domain.Enums;

namespace Hotel.Domain.Models.Rooms;

public class RoomDto
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Floor { get; set; }
    public int Capacity { get; set; }
    public decimal PricePerNight { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Amenities { get; set; } = new();
    public string? Description { get; set; }
}

public class UpdateRoomStatusRequest
{
    public RoomStatus Status { get; set; }
}
