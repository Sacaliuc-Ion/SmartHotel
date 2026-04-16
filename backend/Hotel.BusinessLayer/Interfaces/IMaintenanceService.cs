namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Maintenance;

public interface IMaintenanceService
{
     Task<ServiceResult<List<TicketDto>>> GetTicketsAsync();
     Task<ServiceResult> AcceptTicketAsync(int ticketId, int assignedUserId);
     Task<ServiceResult> ResolveTicketAsync(int ticketId, int assignedUserId);
     Task<ServiceResult<TicketDto>> CreateTicketAsync(CreateTicketRequest request, int reportedByUserId);
}
