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
}
