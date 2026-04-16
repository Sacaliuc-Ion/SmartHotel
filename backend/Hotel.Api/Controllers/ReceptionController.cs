using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Reception;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin,reception,manager")]
public class ReceptionController : ControllerBase
{
     private readonly IReceptionService _receptionService;

     public ReceptionController(IReceptionService receptionService)
     {
          _receptionService = receptionService;
     }

     [HttpGet("arrivals-today")]
     public async Task<IActionResult> GetArrivalsToday()
     {
          var result = await _receptionService.GetArrivalsTodayAsync();
          return Ok(result.Data);
     }

     [HttpGet("departures-today")]
     public async Task<IActionResult> GetDeparturesToday()
     {
          var result = await _receptionService.GetDeparturesTodayAsync();
          return Ok(result.Data);
     }

     [HttpPost("check-in/{reservationId}")]
     [Authorize(Roles = "admin,reception")]
     public async Task<IActionResult> CheckIn(int reservationId, [FromBody] CheckInRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _receptionService.CheckInAsync(reservationId, request, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpPost("check-out/{reservationId}")]
     [Authorize(Roles = "admin,reception")]
     public async Task<IActionResult> CheckOut(int reservationId, [FromBody] CheckOutRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _receptionService.CheckOutAsync(reservationId, request, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }
}
