using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class AmenityData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;   // WiFi, TV, AC, Mini Bar, Jacuzzi, Balcony

    [StringLength(100)]
    public string? Icon { get; set; }

    [StringLength(300)]
    public string? Description { get; set; }

    public ICollection<RoomAmenityData> RoomAmenities { get; set; } = new List<RoomAmenityData>();
}
