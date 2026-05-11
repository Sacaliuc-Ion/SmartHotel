using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Maintenance;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class MaintenanceService : IMaintenanceService
{
     private readonly DbSession _db;

     public MaintenanceService(DbSession db)
     {
          _db = db;
     }

     public async Task<ServiceResult<List<TicketDto>>> GetTicketsAsync()
     {
          var tickets = await _db.Context.MaintenanceTickets
              .Include(t => t.Room)
              .Include(t => t.AssignedTo)
              .OrderByDescending(t => t.CreatedAt)
              .ToListAsync();

          var dtos = tickets.Select(t => new TicketDto
          {
               Id = t.Id,
               RoomId = t.RoomId,
               RoomNumber = t.Room.Number,
               Issue = t.Title,
               Description = t.Description,
               Priority = t.Priority.ToString().ToLower(),
               Status = GetStatusKebabCase(t.Status),
               Assignee = t.AssignedTo != null ? $"{t.AssignedTo.FirstName} {t.AssignedTo.LastName}" : null,
               CreatedAt = t.CreatedAt,
               ResolvedAt = t.ResolvedAt
          }).ToList();

          return ServiceResult<List<TicketDto>>.Ok(dtos);
     }

     public async Task<ServiceResult> AcceptTicketAsync(int ticketId, int assignedUserId)
     {
          var t = await _db.Context.MaintenanceTickets.FindAsync(ticketId);
          if (t == null) return ServiceResult.Fail("Ticket not found");

          t.AssignedToUserId = assignedUserId;
          t.Status = TicketStatus.InProgress;
          await _db.SaveChangesAsync();

          return ServiceResult.Ok();
     }

     public async Task<ServiceResult> ResolveTicketAsync(int ticketId, int assignedUserId)
     {
          var t = await _db.Context.MaintenanceTickets.FindAsync(ticketId);
          if (t == null) return ServiceResult.Fail("Ticket not found");

          t.Status = TicketStatus.Resolved;
          t.ResolvedAt = DateTime.UtcNow;
          await _db.SaveChangesAsync();

          return ServiceResult.Ok();
     }

     public async Task<ServiceResult<TicketDto>> CreateTicketAsync(CreateTicketRequest request, int reportedByUserId)
     {
          var reservation = await _db.Context.Reservations
              .FirstOrDefaultAsync(existingReservation =>
                  existingReservation.Id == request.ReservationId &&
                  existingReservation.UserId == reportedByUserId);

          if (reservation == null)
               return ServiceResult<TicketDto>.Fail("Reservation not found.");

          if (reservation.RoomId != request.RoomId)
               return ServiceResult<TicketDto>.Fail("Reservation does not match the selected room.");

          if (reservation.Status is ReservationStatus.CheckedOut or ReservationStatus.Cancelled or ReservationStatus.NoShow)
               return ServiceResult<TicketDto>.Fail("Tickets can be created only before checkout.");

          var t = new MaintenanceTicket
          {
               RoomId = request.RoomId,
               ReportedByUserId = reportedByUserId,
               Title = request.Issue,
               Description = request.Description,
               Priority = request.Priority
          };
          _db.Context.MaintenanceTickets.Add(t);
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
                  (user.Role.Name == "Maintenance" || user.Role.Name == "Admin" || user.Role.Name == "Manager"))
              .ToListAsync();

          if (recipients.Count > 0)
          {
               var notifications = recipients.Select(user => new UserNotification
               {
                    UserId = user.Id,
                    Title = "Maintenance ticket nou",
                    Message = $"A fost creat un ticket nou pentru camera {roomNumber ?? request.RoomId.ToString()}: {request.Issue}",
               });

               _db.Context.UserNotifications.AddRange(notifications);
               await _db.SaveChangesAsync();
          }

          return ServiceResult<TicketDto>.Ok(new TicketDto { Id = t.Id }); // Simplified return since we typically refetch
     }

     private string GetStatusKebabCase(TicketStatus status) => status switch
     {
          TicketStatus.InProgress => "in-progress",
          TicketStatus.WaitingParts => "waiting-parts",
          _ => status.ToString().ToLower()
     };
}
