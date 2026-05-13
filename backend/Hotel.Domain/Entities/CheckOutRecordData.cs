using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class CheckOutRecordData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Reservation")]
    public int ReservationId { get; set; }

    [Required]
    [DataType(DataType.DateTime)]
    public DateTime CheckedOutAt { get; set; } = DateTime.UtcNow;

    [Required]
    [ForeignKey("ProcessedBy")]
    public int ProcessedByUserId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public ReservationData Reservation { get; set; } = null!;

    public UserData ProcessedBy { get; set; } = null!;
}
