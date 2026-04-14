using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReservationStatus
{
    Confirmed,
    CheckedIn,
    CheckedOut,
    Cancelled,
    NoShow
}
