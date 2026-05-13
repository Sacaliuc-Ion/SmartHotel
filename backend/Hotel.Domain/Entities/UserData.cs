using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class UserData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(255, MinimumLength = 20)]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(20)]
    [DataType(DataType.PhoneNumber)]
    public string? PhoneNumber { get; set; }

    [StringLength(300)]
    public string? AvatarUrl { get; set; }

    [StringLength(200)]
    public string? Address { get; set; }

    [StringLength(80)]
    public string? Country { get; set; }

    [StringLength(80)]
    public string? City { get; set; }

    [DataType(DataType.Date)]
    public DateOnly? DateOfBirth { get; set; }

    [Required]
    [ForeignKey("Role")]
    public int RoleId { get; set; }

    [Required]
    public bool IsActive { get; set; } = true;

    [Required]
    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime? LastLoginAt { get; set; }

    public RoleData Role { get; set; } = null!;
    public ICollection<ReservationData> Reservations { get; set; } = new List<ReservationData>();
    public ICollection<RoomReviewData> RoomReviews { get; set; } = new List<RoomReviewData>();
    public ICollection<UserLoginAuditData> LoginAudits { get; set; } = new List<UserLoginAuditData>();
    public ICollection<UserNotificationData> Notifications { get; set; } = new List<UserNotificationData>();
    public ICollection<HousekeepingTaskData> HousekeepingTasks { get; set; } = new List<HousekeepingTaskData>();
    public ICollection<MaintenanceTicketData> ReportedTickets { get; set; } = new List<MaintenanceTicketData>();
    public ICollection<MaintenanceTicketData> AssignedTickets { get; set; } = new List<MaintenanceTicketData>();
    public ICollection<CheckInRecordData> ProcessedCheckIns { get; set; } = new List<CheckInRecordData>();
    public ICollection<CheckOutRecordData> ProcessedCheckOuts { get; set; } = new List<CheckOutRecordData>();
}
