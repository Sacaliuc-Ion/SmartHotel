using Hotel.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class ReservationData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [ForeignKey("Room")]
    public int RoomId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    public DateOnly CheckInDate { get; set; }

    [Required]
    [DataType(DataType.Date)]
    public DateOnly CheckOutDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }

    [Required]
    public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;

    [Required]
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    [Required]
    [Range(1, 20)]
    public int Guests { get; set; } = 1;

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserData User { get; set; } = null!;

    public RoomData Room { get; set; } = null!;

    public CheckInRecordData? CheckInRecord { get; set; }
    public CheckOutRecordData? CheckOutRecord { get; set; }
    public RoomReviewData? Review { get; set; }
}
