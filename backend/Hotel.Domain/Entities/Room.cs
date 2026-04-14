using Hotel.Domain.Enums;

namespace Hotel.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public int Floor { get; set; }
    public int Capacity { get; set; }
    public decimal PricePerNight { get; set; }
    public int RoomTypeId { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public bool IsActive { get; set; } = true;

    public RoomType RoomType { get; set; } = null!;
    public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();

}
