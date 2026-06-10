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
          var rooms = await _db.Context.Rooms
              .Where(room => room.IsActive)
              .ToListAsync();
          var tickets = await _db.Context.MaintenanceTickets.ToListAsync();
          var reservations = await _db.Context.Reservations.ToListAsync();
          var housekeepingTasks = await _db.Context.HousekeepingTasks.ToListAsync();

          var currentCheckIns = reservations
              .Where(reservation => reservation.Status == ReservationStatus.CheckedIn)
              .ToList();

          var totalRevenue = reservations
              .Where(reservation => reservation.Status == ReservationStatus.CheckedIn || reservation.Status == ReservationStatus.CheckedOut)
              .Sum(reservation => reservation.TotalPrice);

          var totalRooms = rooms.Count;
          var occupiedRooms = currentCheckIns.Count;
          var occupancyRate = totalRooms > 0 ? (int)Math.Round((double)occupiedRooms / totalRooms * 100) : 0;
          var openTickets = tickets.Count(ticket => ticket.Status != TicketStatus.Resolved && ticket.Status != TicketStatus.Closed);
          var outOfOrderRooms = rooms.Count(room => room.Status == RoomStatus.OutOfOrder);
          var dirtyRooms = rooms.Count(room => room.Status == RoomStatus.Dirty || room.Status == RoomStatus.Cleaning);
          var availableRooms = Math.Max(0, totalRooms - occupiedRooms - dirtyRooms - outOfOrderRooms);

          var completedStays = reservations
              .Where(reservation =>
              {
                   var nights = reservation.CheckOutDate.DayNumber - reservation.CheckInDate.DayNumber;
                   return nights > 0 && (reservation.Status == ReservationStatus.CheckedIn || reservation.Status == ReservationStatus.CheckedOut);
              })
              .ToList();

          var averageDailyRate = completedStays.Count == 0
               ? 0
               : Math.Round(completedStays.Average(reservation =>
                    reservation.TotalPrice / (reservation.CheckOutDate.DayNumber - reservation.CheckInDate.DayNumber)), 0);

          var completedHousekeepingTasks = housekeepingTasks
              .Where(task =>
                   task.UpdatedAt.HasValue &&
                   (task.Status == HousekeepingTaskStatus.Clean || task.Status == HousekeepingTaskStatus.Inspected) &&
                   task.UpdatedAt.Value >= task.CreatedAt)
              .ToList();

          var avgCleaningTimeMinutes = completedHousekeepingTasks.Count == 0
               ? 0
               : (int)Math.Round(completedHousekeepingTasks.Average(task => (task.UpdatedAt!.Value - task.CreatedAt).TotalMinutes));

          var resolvedTickets = tickets
              .Where(ticket => ticket.ResolvedAt.HasValue && ticket.ResolvedAt.Value >= ticket.CreatedAt)
              .ToList();

          var avgResolutionTimeDays = resolvedTickets.Count == 0
               ? 0
               : Math.Round((decimal)resolvedTickets.Average(ticket => (ticket.ResolvedAt!.Value - ticket.CreatedAt).TotalDays), 1);

          var criticalIssues = tickets.Count(ticket =>
               ticket.Priority == TicketPriority.Urgent &&
               ticket.Status != TicketStatus.Resolved &&
               ticket.Status != TicketStatus.Closed);

          var today = DateOnly.FromDateTime(DateTime.Now);
          var occupancyTrend = Enumerable.Range(0, 7)
              .Select(offset =>
              {
                   var date = today.AddDays(offset - 6);
                   var occupiedForDay = reservations.Count(reservation =>
                        reservation.Status != ReservationStatus.Cancelled &&
                        reservation.Status != ReservationStatus.NoShow &&
                        reservation.CheckInDate <= date &&
                        date < reservation.CheckOutDate);

                   return new DashboardTrendPointDto
                   {
                        Date = date.ToString("yyyy-MM-dd"),
                        OccupiedRooms = occupiedForDay,
                        OccupancyRate = totalRooms > 0 ? (int)Math.Round((double)occupiedForDay / totalRooms * 100) : 0
                   };
              })
              .ToList();

          var summary = new DashboardSummaryDto
          {
               TotalRooms = totalRooms,
               OccupiedRooms = occupiedRooms,
               OccupancyRate = occupancyRate,
               TotalRevenue = totalRevenue,
               OpenTickets = openTickets,
               OutOfOrderRooms = outOfOrderRooms,
               DirtyRooms = dirtyRooms,
               AverageDailyRate = averageDailyRate,
               AvgCleaningTimeMinutes = avgCleaningTimeMinutes,
               AvgResolutionTimeDays = avgResolutionTimeDays,
               CriticalIssues = criticalIssues,
               OccupancyTrend = occupancyTrend,
               RoomStatusBreakdown = new List<DashboardCountDto>
               {
                    new() { Key = "available", Count = availableRooms },
                    new() { Key = "occupied", Count = occupiedRooms },
                    new() { Key = "dirty-cleaning", Count = dirtyRooms },
                    new() { Key = "out-of-order", Count = outOfOrderRooms }
               },
               TicketStatusBreakdown = new List<DashboardCountDto>
               {
                    new() { Key = "new", Count = tickets.Count(ticket => ticket.Status == TicketStatus.New) },
                    new() { Key = "in-progress", Count = tickets.Count(ticket => ticket.Status == TicketStatus.InProgress) },
                    new() { Key = "waiting-parts", Count = tickets.Count(ticket => ticket.Status == TicketStatus.WaitingParts) },
                    new() { Key = "resolved", Count = tickets.Count(ticket => ticket.Status == TicketStatus.Resolved) }
               }
          };

          return ServiceResult<DashboardSummaryDto>.Ok(summary);
     }
}
