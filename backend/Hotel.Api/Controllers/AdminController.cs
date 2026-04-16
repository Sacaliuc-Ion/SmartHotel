using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
     private readonly IAdminService _adminService;

     public AdminController(IAdminService adminService)
     {
          _adminService = adminService;
     }

     [HttpGet("users")]
     public async Task<IActionResult> GetUsers()
     {
          var result = await _adminService.GetUsersAsync();
          return Ok(result.Data);
     }

     [HttpPatch("users/{id}/toggle-active")]
     public async Task<IActionResult> ToggleUser(int id)
     {
          var result = await _adminService.ToggleUserActiveAsync(id);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }

     [HttpGet("settings")]
     public async Task<IActionResult> GetSettings()
     {
          var result = await _adminService.GetSettingsAsync();
          return Ok(result.Data);
     }

     [HttpPut("settings/{key}")]
     public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
     {
          var result = await _adminService.UpdateSettingAsync(key, request);
          if (!result.Success) return BadRequest(new { message = result.Message });
          return Ok();
     }
}
