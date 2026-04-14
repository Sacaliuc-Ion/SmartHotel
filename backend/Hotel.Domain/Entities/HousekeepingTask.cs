using Hotel.Domain.Enums;

namespace Hotel.Domain.Entities;

public class HousekeepingTask
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public int? AssignedToUserId { get; set; }
    public HousekeepingTaskStatus Status { get; set; } = HousekeepingTaskStatus.Pending;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Room Room { get; set; } = null!;
    public User? AssignedTo { get; set; }
}
