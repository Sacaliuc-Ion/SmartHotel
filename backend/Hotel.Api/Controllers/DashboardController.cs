using Hotel.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin,manager")]
public class DashboardController : ControllerBase
{
     private readonly IDashboardService _dashboardService;

     public DashboardController(IDashboardService dashboardService)
     {
          _dashboardService = dashboardService;
     }

     [HttpGet]
     public async Task<IActionResult> GetSummary()
     {
          var result = await _dashboardService.GetDashboardSummaryAsync();
          return Ok(result.Data);
     }
}
