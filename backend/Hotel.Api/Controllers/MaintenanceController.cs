using Hotel.BusinessLayer.Core;
using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Maintenance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
     private readonly IMaintenanceService _maintenanceService;

     public MaintenanceController(IMaintenanceService maintenanceService)
     {
          _maintenanceService = maintenanceService;
     }

     [HttpGet("tickets")]
     [Authorize(Roles = "admin,maintenance")]
     public async Task<IActionResult> GetTickets()
     {
          var result = await _maintenanceService.GetTicketsAsync();
          return Ok(result.Data);
     }

     [HttpPost("tickets")]
     public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _maintenanceService.CreateTicketAsync(request, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok(result.Data);
     }

     [HttpPatch("tickets/{id}/accept")]
     [Authorize(Roles = "admin,maintenance")]
     public async Task<IActionResult> AcceptTicket(int id)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _maintenanceService.AcceptTicketAsync(id, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpPatch("tickets/{id}/resolve")]
     [Authorize(Roles = "admin,maintenance")]
     public async Task<IActionResult> ResolveTicket(int id)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _maintenanceService.ResolveTicketAsync(id, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }
}
