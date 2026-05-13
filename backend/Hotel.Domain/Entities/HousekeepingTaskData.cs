using Hotel.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class HousekeepingTaskData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Room")]
    public int RoomId { get; set; }

    [ForeignKey("AssignedTo")]
    public int? AssignedToUserId { get; set; }

    [Required]
    public HousekeepingTaskStatus Status { get; set; } = HousekeepingTaskStatus.Pending;

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime? UpdatedAt { get; set; }

    public RoomData Room { get; set; } = null!;

    public UserData? AssignedTo { get; set; }
}
