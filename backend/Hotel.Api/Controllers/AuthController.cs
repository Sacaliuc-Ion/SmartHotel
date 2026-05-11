using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
     private readonly IAuthService _authService;

     public AuthController(IAuthService authService)
     {
          _authService = authService;
     }

     [HttpPost("login")]
     public async Task<IActionResult> Login([FromBody] LoginRequest request)
     {
          request.IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
          request.UserAgent = Request.Headers.UserAgent.ToString();
          var result = await _authService.LoginAsync(request);

          if (!result.Success)
               return Unauthorized(new { message = result.Message });

          return Ok(result.Data);
     }

     [HttpPost("register")]
     public async Task<IActionResult> Register([FromBody] RegisterRequest request)
     {
          var result = await _authService.RegisterAsync(request);

          if (!result.Success)
               return BadRequest(new { message = result.Message });

          return Ok(result.Data);
     }

     [HttpGet("profile")]
     [Authorize]
     public async Task<IActionResult> GetProfile()
     {
          var result = await _authService.GetProfileAsync(GetUserId());
          if (!result.Success) return NotFound(new { message = result.Message });
          return Ok(result.Data);
     }

     [HttpPut("profile")]
     [Authorize]
     public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
     {
          var result = await _authService.UpdateProfileAsync(GetUserId(), request);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok(result.Data);
     }

     [HttpPost("change-password")]
     [Authorize]
     public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
     {
          var result = await _authService.ChangePasswordAsync(GetUserId(), request);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpGet("recent-logins")]
     [Authorize]
     public async Task<IActionResult> GetRecentLogins()
     {
          var result = await _authService.GetRecentLoginsAsync(GetUserId());
          return Ok(result.Data);
     }

     [HttpGet("notifications")]
     [Authorize]
     public async Task<IActionResult> GetNotifications()
     {
          var result = await _authService.GetNotificationsAsync(GetUserId());
          return Ok(result.Data);
     }

     [HttpPatch("notifications/{id}/read")]
     [Authorize]
     public async Task<IActionResult> MarkNotificationRead(int id)
     {
          var result = await _authService.MarkNotificationReadAsync(id, GetUserId());
          if (!result.Success) return NotFound(new { message = result.Message });
          return Ok();
     }

     [HttpPatch("notifications/read-all")]
     [Authorize]
     public async Task<IActionResult> MarkAllNotificationsRead()
     {
          var result = await _authService.MarkAllNotificationsReadAsync(GetUserId());
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpDelete("account")]
     [Authorize]
     public async Task<IActionResult> DeleteAccount()
     {
          var result = await _authService.DeleteAccountAsync(GetUserId());
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
