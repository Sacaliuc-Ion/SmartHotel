using Hotel.Domain.Enums;

namespace Hotel.Domain.Models.Housekeeping;

public class HousekeepingTaskDto
{
     public int Id { get; set; }
     public int RoomId { get; set; }
     public string RoomNumber { get; set; } = string.Empty;
     public string Status { get; set; } = string.Empty;
     public string? AssignedTo { get; set; }
     public string? Notes { get; set; }
}

public class ReportIssueRequest
{
     public int RoomId { get; set; }
     public string Issue { get; set; } = string.Empty;
     public string? Description { get; set; }
     public TicketPriority Priority { get; set; }
}
