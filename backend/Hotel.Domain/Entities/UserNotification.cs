namespace Hotel.Domain.Entities;

public class UserNotification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? ReservationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Reservation? Reservation { get; set; }
}
