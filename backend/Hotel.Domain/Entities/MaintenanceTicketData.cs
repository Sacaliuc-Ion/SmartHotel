using Hotel.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class MaintenanceTicketData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Room")]
    public int RoomId { get; set; }

    [Required]
    [ForeignKey("ReportedBy")]
    public int ReportedByUserId { get; set; }

    [ForeignKey("AssignedTo")]
    public int? AssignedToUserId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public TicketPriority Priority { get; set; } = TicketPriority.Low;

    [Required]
    public TicketStatus Status { get; set; } = TicketStatus.New;

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime? ResolvedAt { get; set; }

    public RoomData Room { get; set; } = null!;

    public UserData ReportedBy { get; set; } = null!;

    public UserData? AssignedTo { get; set; }
}
