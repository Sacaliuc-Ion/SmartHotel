using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Housekeeping;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class HousekeepingService : IHousekeepingService
{
     private readonly DbSession _db;
     private const string ClientRequestPrefix = "[CLIENT_HK]";

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

     public async Task<ServiceResult<List<ClientHousekeepingRequestDto>>> GetClientRequestsAsync()
     {
          var tasks = await _db.Context.HousekeepingTasks
              .Include(task => task.Room)
              .Where(task =>
                   task.Notes != null &&
                   task.Notes.StartsWith(ClientRequestPrefix) &&
                   task.Status != HousekeepingTaskStatus.Clean &&
                   task.Status != HousekeepingTaskStatus.Inspected)
              .OrderByDescending(task => task.CreatedAt)
              .ToListAsync();

          var requests = tasks.Select(task =>
          {
               var payload = ParseClientRequestNotes(task.Notes);
               return new ClientHousekeepingRequestDto
               {
                    Id = task.Id,
                    RoomId = task.RoomId,
                    RoomNumber = task.Room.Number,
                    Issue = payload.Issue,
                    Description = payload.Description,
                    Priority = payload.Priority,
                    Status = task.Status.ToString().ToLower(),
                    ReportedBy = payload.ReportedBy,
                    CreatedAt = task.CreatedAt.ToString("O")
               };
          }).ToList();

          return ServiceResult<List<ClientHousekeepingRequestDto>>.Ok(requests);
     }

     public async Task<ServiceResult> ReportIssueAsync(ReportIssueRequest request, int reportedByUserId)
     {
          var reportedBy = await _db.Context.Users
              .Where(user => user.Id == reportedByUserId)
              .Select(user => $"{user.FirstName} {user.LastName}")
              .FirstOrDefaultAsync();

          var task = new HousekeepingTask
          {
               RoomId = request.RoomId,
               Status = HousekeepingTaskStatus.Pending,
               Notes = BuildClientRequestNotes(request.Issue, request.Description, request.Priority.ToString().ToLower(), reportedBy)
          };

          _db.Context.HousekeepingTasks.Add(task);
          await _db.SaveChangesAsync();

          var roomNumber = await _db.Context.Rooms
              .Where(room => room.Id == request.RoomId)
              .Select(room => room.Number)
              .FirstOrDefaultAsync();

          var recipients = await _db.Context.Users
              .Include(user => user.Role)
              .Where(user =>
                  user.IsActive &&
                  user.Id != reportedByUserId &&
                  (user.Role.Name == "Housekeeping" || user.Role.Name == "Admin" || user.Role.Name == "Manager"))
              .ToListAsync();

          if (recipients.Count > 0)
          {
               var notifications = recipients.Select(user => new UserNotification
               {
                    UserId = user.Id,
                    Title = "Housekeeping ticket nou",
                    Message = $"A fost creata o solicitare noua pentru camera {roomNumber ?? request.RoomId.ToString()}: {request.Issue}",
               });

               _db.Context.UserNotifications.AddRange(notifications);
               await _db.SaveChangesAsync();
          }

          return ServiceResult.Ok();
     }

     public async Task<ServiceResult> ResolveClientRequestAsync(int requestId, int processedByUserId)
     {
          var task = await _db.Context.HousekeepingTasks
              .FirstOrDefaultAsync(existingTask => existingTask.Id == requestId && existingTask.Notes != null && existingTask.Notes.StartsWith(ClientRequestPrefix));

          if (task == null)
               return ServiceResult.Fail("Client housekeeping request not found.");

          task.Status = HousekeepingTaskStatus.Clean;
          task.UpdatedAt = DateTime.UtcNow;
          await _db.SaveChangesAsync();

          return ServiceResult.Ok();
     }

     private static string BuildClientRequestNotes(string issue, string? description, string priority, string? reportedBy)
     {
          return string.Join("|", new[]
          {
               ClientRequestPrefix,
               SanitizeNotePart(issue),
               SanitizeNotePart(description),
               SanitizeNotePart(priority),
               SanitizeNotePart(reportedBy)
          });
     }

     private static (string Issue, string? Description, string Priority, string? ReportedBy) ParseClientRequestNotes(string? notes)
     {
          var parts = (notes ?? string.Empty).Split('|');

          return (
               parts.Length > 1 ? RestoreNotePart(parts[1]) ?? "Solicitare client" : "Solicitare client",
               parts.Length > 2 ? RestoreNotePart(parts[2]) : null,
               parts.Length > 3 ? RestoreNotePart(parts[3]) ?? "medium" : "medium",
               parts.Length > 4 ? RestoreNotePart(parts[4]) : null
          );
     }

     private static string SanitizeNotePart(string? value)
     {
          return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Replace("|", "/").Trim();
     }

     private static string? RestoreNotePart(string? value)
     {
          return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
     }
}
