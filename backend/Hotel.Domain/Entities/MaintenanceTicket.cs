using Hotel.Domain.Enums;

namespace Hotel.Domain.Entities;

public class MaintenanceTicket
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public int ReportedByUserId { get; set; }
    public int? AssignedToUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TicketPriority Priority { get; set; } = TicketPriority.Low;
    public TicketStatus Status { get; set; } = TicketStatus.New;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    public Room Room { get; set; } = null!;
    public User ReportedBy { get; set; } = null!;
    public User? AssignedTo { get; set; }
}
