using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TicketPriority
{
    Low,
    Medium,
    High,
    Urgent
}
