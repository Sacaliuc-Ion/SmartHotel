namespace Hotel.Domain.Entities;

public class Amenity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;   // WiFi, TV, AC, Mini Bar, Jacuzzi, Balcony
    public string? Icon { get; set; }
    public string? Description { get; set; }

    public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
}
