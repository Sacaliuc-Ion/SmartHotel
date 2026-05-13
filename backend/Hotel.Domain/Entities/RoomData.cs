using Hotel.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class RoomData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Number { get; set; } = string.Empty;

    [Required]
    [Range(0, 100)]
    public int Floor { get; set; }

    [Required]
    [Range(1, 20)]
    public int Capacity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    [Required]
    [ForeignKey("RoomType")]
    public int RoomTypeId { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(300)]
    public string? ImageUrl { get; set; }

    [Required]
    public RoomStatus Status { get; set; } = RoomStatus.Available;

    [Required]
    public bool IsActive { get; set; } = true;

    public RoomTypeData RoomType { get; set; } = null!;
    public ICollection<RoomAmenityData> RoomAmenities { get; set; } = new List<RoomAmenityData>();
    public ICollection<RoomReviewData> Reviews { get; set; } = new List<RoomReviewData>();

}
