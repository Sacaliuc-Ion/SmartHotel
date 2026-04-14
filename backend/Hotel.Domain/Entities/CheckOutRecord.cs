namespace Hotel.Domain.Entities;

public class CheckOutRecord
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public DateTime CheckedOutAt { get; set; } = DateTime.UtcNow;
    public int ProcessedByUserId { get; set; }
    public string? Notes { get; set; }

    public Reservation Reservation { get; set; } = null!;
    public User ProcessedBy { get; set; } = null!;
}
