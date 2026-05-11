using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Reservations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
     private readonly IReservationService _reservationService;

     public ReservationsController(IReservationService reservationService)
     {
          _reservationService = reservationService;
     }

     [HttpGet]
     [Authorize(Roles = "admin,reception,manager")]
     public async Task<IActionResult> GetAll()
     {
          var result = await _reservationService.GetAllReservationsAsync();
          return Ok(result.Data);
     }

     [HttpGet("my")]
     public async Task<IActionResult> GetMy()
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _reservationService.GetMyReservationsAsync(userId);
          return Ok(result.Data);
     }

     [HttpGet("reviews/summary")]
     [AllowAnonymous]
     public async Task<IActionResult> GetReviewSummary()
     {
          var result = await _reservationService.GetReviewSummaryAsync();
          return Ok(result.Data);
     }

     [HttpPost]
     public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _reservationService.CreateReservationAsync(request, userId);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok(result.Data);
     }

     [HttpPatch("{id}/cancel")]
     public async Task<IActionResult> Cancel(int id)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var isAdminOrReception = User.IsInRole("admin") || User.IsInRole("reception") || User.IsInRole("manager");

          var result = await _reservationService.CancelReservationAsync(id, userId, isAdminOrReception);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpPost("{id}/review")]
     public async Task<IActionResult> AddReview(int id, [FromBody] CreateRoomReviewRequest request)
     {
          var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
          var result = await _reservationService.AddReviewAsync(id, userId, request);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok(result.Data);
     }
}
