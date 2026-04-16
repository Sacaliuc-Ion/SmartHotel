namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Dashboard;

public interface IDashboardService
{
     Task<ServiceResult<DashboardSummaryDto>> GetDashboardSummaryAsync();
}
