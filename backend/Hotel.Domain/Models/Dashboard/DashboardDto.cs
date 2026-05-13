namespace Hotel.Domain.Models.Dashboard;

public class DashboardSummaryDto
{
     public int OccupancyRate { get; set; }
     public int TotalRooms { get; set; }
     public int OccupiedRooms { get; set; }
     public decimal TotalRevenue { get; set; }
     public int OpenTickets { get; set; }
     public int OutOfOrderRooms { get; set; }
     public int DirtyRooms { get; set; }
     public decimal AverageDailyRate { get; set; }
     public int AvgCleaningTimeMinutes { get; set; }
     public decimal AvgResolutionTimeDays { get; set; }
     public int CriticalIssues { get; set; }
     public List<DashboardTrendPointDto> OccupancyTrend { get; set; } = new();
     public List<DashboardCountDto> RoomStatusBreakdown { get; set; } = new();
     public List<DashboardCountDto> TicketStatusBreakdown { get; set; } = new();
}

public class DashboardTrendPointDto
{
     public string Date { get; set; } = string.Empty;
     public int OccupancyRate { get; set; }
     public int OccupiedRooms { get; set; }
}

public class DashboardCountDto
{
     public string Key { get; set; } = string.Empty;
     public int Count { get; set; }
}
