namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Housekeeping;

public interface IHousekeepingService
{
     Task<ServiceResult<List<HousekeepingTaskDto>>> GetTasksAsync();
     Task<ServiceResult<List<ClientHousekeepingRequestDto>>> GetClientRequestsAsync();
     Task<ServiceResult> ReportIssueAsync(ReportIssueRequest request, int reportedByUserId);
     Task<ServiceResult> ResolveClientRequestAsync(int requestId, int processedByUserId);
}
