using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class DashboardService : IDashboardService
{
     private readonly DbSession _db;

     public DashboardService(DbSession db)
     {
          _db = db;
     }

     public async Task<ServiceResult<DashboardSummaryDto>> GetDashboardSummaryAsync()
     {
          var rooms = await _db.Context.Rooms.ToListAsync();
          var tickets = await _db.Context.MaintenanceTickets.ToListAsync();
          var currentCheckIns = await _db.Context.Reservations
              .Where(r => r.Status == ReservationStatus.CheckedIn)
              .ToListAsync();

          var totalRevenue = await _db.Context.Reservations
              .Where(r => r.Status == ReservationStatus.CheckedIn || r.Status == ReservationStatus.CheckedOut)
              .SumAsync(r => r.TotalPrice);

          var totalRooms = rooms.Count(r => r.IsActive);
          var occupiedRooms = currentCheckIns.Count;
          var occupancyRate = totalRooms > 0 ? (int)Math.Round((double)occupiedRooms / totalRooms * 100) : 0;

          var summary = new DashboardSummaryDto
          {
               TotalRooms = totalRooms,
               OccupiedRooms = occupiedRooms,
               OccupancyRate = occupancyRate,
               TotalRevenue = totalRevenue,
               OpenTickets = tickets.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
               OutOfOrderRooms = rooms.Count(r => r.Status == RoomStatus.OutOfOrder),
               DirtyRooms = rooms.Count(r => r.Status == RoomStatus.Dirty || r.Status == RoomStatus.Cleaning)
          };

          return ServiceResult<DashboardSummaryDto>.Ok(summary);
     }
}
