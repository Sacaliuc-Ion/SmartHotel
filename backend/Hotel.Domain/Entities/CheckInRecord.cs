namespace Hotel.Domain.Entities;

public class CheckInRecord
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public DateTime CheckedInAt { get; set; } = DateTime.UtcNow;
    public int ProcessedByUserId { get; set; }
    public string? Notes { get; set; }

    public Reservation Reservation { get; set; } = null!;
    public User ProcessedBy { get; set; } = null!;
}
