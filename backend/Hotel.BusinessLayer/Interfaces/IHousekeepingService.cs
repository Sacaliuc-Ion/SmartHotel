namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Housekeeping;

public interface IHousekeepingService
{
     Task<ServiceResult<List<HousekeepingTaskDto>>> GetTasksAsync();
     Task<ServiceResult> ReportIssueAsync(ReportIssueRequest request, int reportedByUserId);
}
