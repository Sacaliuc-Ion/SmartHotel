using Hotel.Domain.Enums;

namespace Hotel.Domain.Models.Maintenance;

public class TicketDto
{
     public int Id { get; set; }
     public int RoomId { get; set; }
     public string RoomNumber { get; set; } = string.Empty;
     public string Issue { get; set; } = string.Empty;
     public string? Description { get; set; }
     public string Priority { get; set; } = string.Empty;
     public string Status { get; set; } = string.Empty;
     public string? Assignee { get; set; }
     public DateTime CreatedAt { get; set; }
     public DateTime? ResolvedAt { get; set; }
}

public class CreateTicketRequest
{
     public int RoomId { get; set; }
     public string Issue { get; set; } = string.Empty;
     public string? Description { get; set; }
     public TicketPriority Priority { get; set; }
}
