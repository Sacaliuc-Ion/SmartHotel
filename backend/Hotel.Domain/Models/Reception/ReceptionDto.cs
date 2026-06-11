namespace Hotel.Domain.Models.Reception;

public class CheckInRequest
{
    public string? Notes { get; set; }
    public string? PaymentStatus { get; set; }
}

public class CheckOutRequest
{
    public string? Notes { get; set; }
    public string? PaymentStatus { get; set; }
}
