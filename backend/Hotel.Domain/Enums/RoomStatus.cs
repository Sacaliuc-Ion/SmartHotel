using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomStatus
{
    Available,
    Occupied,
    Dirty,
    Cleaning,
    Clean,
    Ready,
    OutOfOrder,
    Inspected,
    OutOfService
}
