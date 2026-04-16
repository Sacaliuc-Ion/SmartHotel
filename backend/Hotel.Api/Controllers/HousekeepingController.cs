using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Housekeeping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin,housekeeping")]
public class HousekeepingController : ControllerBase
{
     private readonly IHousekeepingService _housekeepingService;

     public HousekeepingController(IHousekeepingService housekeepingService)
     {
          _housekeepingService = housekeepingService;
     }

     [HttpGet("tasks")]
     public async Task<IActionResult> GetTasks()
     {
          var result = await _housekeepingService.GetTasksAsync();
          return Ok(result.Data);
     }

     [HttpPost("report-issue")]
     public async Task<IActionResult> ReportIssue([FromBody] ReportIssueRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _housekeepingService.ReportIssueAsync(request, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }
}
