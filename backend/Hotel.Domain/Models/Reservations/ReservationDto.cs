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
    public string CheckInTime { get; set; } = string.Empty; // HH:mm
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Guests { get; set; }
    public string? Notes { get; set; }
    public RoomReviewDto? Review { get; set; }
}

public class CreateReservationRequest
{
    public int RoomId { get; set; }
    public string CheckIn { get; set; } = string.Empty;
    public string CheckOut { get; set; } = string.Empty;
    public string? CheckInTime { get; set; }
    public int Guests { get; set; }
}

public class UpdateReservationRequest
{
    public int RoomId { get; set; }
    public string CheckIn { get; set; } = string.Empty;
    public string CheckOut { get; set; } = string.Empty;
    public string? CheckInTime { get; set; }
    public string? PaymentStatus { get; set; }
    public int Guests { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateReservationPaymentStatusRequest
{
    public string PaymentStatus { get; set; } = string.Empty;
}

public class RoomReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateRoomReviewRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewSummaryDto
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}

public class GymAccessDto
{
    public bool IsAuthenticated { get; set; }
    public bool HasAccess { get; set; }
    public bool HasUpcomingReservation { get; set; }
    public string AccessMode { get; set; } = "included-with-stay";
    public int? ReservationId { get; set; }
    public string? RoomNumber { get; set; }
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
}

public class SpaAccessDto
{
    public bool IsAuthenticated { get; set; }
    public bool HasAccess { get; set; }
    public bool HasUpcomingReservation { get; set; }
    public string AccessMode { get; set; } = "included-with-stay";
    public int? ReservationId { get; set; }
    public string? RoomNumber { get; set; }
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
}
