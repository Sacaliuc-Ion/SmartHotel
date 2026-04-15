using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Auth;
using Microsoft.AspNetCore.Mvc;

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
}
