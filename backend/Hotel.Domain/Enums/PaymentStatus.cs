using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    Unpaid,
    Partial,
    Paid
}
