using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Models.Housekeeping;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class HousekeepingService : IHousekeepingService
{
     private readonly DbSession _db;

     public HousekeepingService(DbSession db)
     {
          _db = db;
     }

     public async Task<ServiceResult<List<HousekeepingTaskDto>>> GetTasksAsync()
     {
          // Simple implementation: generate tasks on the fly based on room status, or read from Tasks table
          // For simplicity with frontend, we just map rooms that are dirty/cleaning
          var rooms = await _db.Context.Rooms
              .Where(r => r.Status == Domain.Enums.RoomStatus.Dirty || r.Status == Domain.Enums.RoomStatus.Cleaning)
              .ToListAsync();

          var tasks = rooms.Select(r => new HousekeepingTaskDto
          {
               Id = r.Id,
               RoomId = r.Id,
               RoomNumber = r.Number,
               Status = r.Status.ToString().ToLower()
          }).ToList();

          return ServiceResult<List<HousekeepingTaskDto>>.Ok(tasks);
     }

     public async Task<ServiceResult> ReportIssueAsync(ReportIssueRequest request, int reportedByUserId)
     {
          var ticket = new MaintenanceTicket
          {
               RoomId = request.RoomId,
               ReportedByUserId = reportedByUserId,
               Title = request.Issue,
               Description = request.Description,
               Priority = request.Priority,
               Status = Domain.Enums.TicketStatus.New
          };

          _db.Context.MaintenanceTickets.Add(ticket);
          await _db.SaveChangesAsync();

          return ServiceResult.Ok();
     }
}
