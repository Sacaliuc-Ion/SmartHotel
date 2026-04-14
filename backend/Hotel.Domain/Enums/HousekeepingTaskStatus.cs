using System.Text.Json.Serialization;

namespace Hotel.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HousekeepingTaskStatus
{
    Pending,
    InProgress,
    Clean,
    Inspected,
    OutOfService
}
