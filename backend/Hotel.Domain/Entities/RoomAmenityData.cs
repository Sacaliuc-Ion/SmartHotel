using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class RoomAmenityData
{
    [Required]
    [ForeignKey("Room")]
    public int RoomId { get; set; }

    [Required]
    [ForeignKey("Amenity")]
    public int AmenityId { get; set; }

    public RoomData Room { get; set; } = null!;

    public AmenityData Amenity { get; set; } = null!;
}
