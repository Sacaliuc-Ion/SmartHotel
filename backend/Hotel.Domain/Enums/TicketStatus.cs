using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TicketStatus
{
    New,
    InProgress,
    WaitingParts,
    Resolved,
    Closed
}
