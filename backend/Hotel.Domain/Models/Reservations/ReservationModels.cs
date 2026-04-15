using Hotel.Domain.Enums;

namespace Hotel.Domain.Models.Reservations;

public class ReservationDto
{
    public int Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string CheckIn { get; set; } = string.Empty; // YYYY-MM-DD
    public string CheckOut { get; set; } = string.Empty; // YYYY-MM-DD
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Guests { get; set; }
}

public class CreateReservationRequest
{
    public int RoomId { get; set; }
    public string CheckIn { get; set; } = string.Empty;
    public string CheckOut { get; set; } = string.Empty;
    public int Guests { get; set; }
}
