using Hotel.Domain.Enums;

namespace Hotel.Domain.Entities;

public class Reservation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public decimal TotalPrice { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public int Guests { get; set; } = 1;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Room Room { get; set; } = null!;
    public CheckInRecord? CheckInRecord { get; set; }
    public CheckOutRecord? CheckOutRecord { get; set; }
}
