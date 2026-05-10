namespace Hotel.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Address { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public int RoleId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public Role Role { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<RoomReview> RoomReviews { get; set; } = new List<RoomReview>();
    public ICollection<UserLoginAudit> LoginAudits { get; set; } = new List<UserLoginAudit>();
    public ICollection<UserNotification> Notifications { get; set; } = new List<UserNotification>();
    public ICollection<HousekeepingTask> HousekeepingTasks { get; set; } = new List<HousekeepingTask>();
    public ICollection<MaintenanceTicket> ReportedTickets { get; set; } = new List<MaintenanceTicket>();
    public ICollection<MaintenanceTicket> AssignedTickets { get; set; } = new List<MaintenanceTicket>();
    public ICollection<CheckInRecord> ProcessedCheckIns { get; set; } = new List<CheckInRecord>();
    public ICollection<CheckOutRecord> ProcessedCheckOuts { get; set; } = new List<CheckOutRecord>();
}
