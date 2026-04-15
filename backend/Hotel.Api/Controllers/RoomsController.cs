using Hotel.BusinessLayer.Interfaces;
using Hotel.Domain.Models.Rooms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
     private readonly IRoomService _roomService;

     public RoomsController(IRoomService roomService)
     {
          _roomService = roomService;
     }

     [HttpGet]
     public async Task<IActionResult> GetAll()
     {
          var result = await _roomService.GetAllRoomsAsync();
          return Ok(result.Data);
     }

     [HttpGet("{id}")]
     public async Task<IActionResult> GetById(int id)
     {
          var result = await _roomService.GetRoomByIdAsync(id);
          if (!result.Success)
               return NotFound(new { message = result.Message });

          return Ok(result.Data);
     }

     [HttpPatch("{id}/status")]
     [Authorize(Roles = "admin,reception,housekeeping")]
     public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRoomStatusRequest request)
     {
          var result = await _roomService.UpdateRoomStatusAsync(id, request);
          if (!result.Success)
               return BadRequest(new { message = result.Message });

          return Ok();
     }
}
