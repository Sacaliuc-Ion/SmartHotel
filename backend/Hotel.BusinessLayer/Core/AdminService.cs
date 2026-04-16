using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Models.Admin;
using Hotel.Domain.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class AdminService : IAdminService
{
     private readonly DbSession _db;

     public AdminService(DbSession db)
     {
          _db = db;
     }

     public async Task<ServiceResult<List<UserDto>>> GetUsersAsync()
     {
          var users = await _db.Context.Users.Include(u => u.Role).ToListAsync();
          var dtos = users.Select(u => new UserDto
          {
               Id = u.Id,
               Name = $"{u.FirstName} {u.LastName}",
               Email = u.Email,
               Role = u.Role.Name.ToLower()
          }).ToList();

          return ServiceResult<List<UserDto>>.Ok(dtos);
     }

     public async Task<ServiceResult> ToggleUserActiveAsync(int userId)
     {
          var user = await _db.Context.Users.FindAsync(userId);
          if (user == null) return ServiceResult.Fail("User not found");

          user.IsActive = !user.IsActive;
          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }

     public async Task<ServiceResult<List<SettingDto>>> GetSettingsAsync()
     {
          var settings = await _db.Context.HotelSettings.ToListAsync();
          var dtos = settings.Select(s => new SettingDto
          {
               Key = s.Key,
               Value = s.Value,
               Description = s.Description
          }).ToList();

          return ServiceResult<List<SettingDto>>.Ok(dtos);
     }

     public async Task<ServiceResult> UpdateSettingAsync(string key, UpdateSettingRequest request)
     {
          var setting = await _db.Context.HotelSettings.FirstOrDefaultAsync(s => s.Key == key);
          if (setting == null) return ServiceResult.Fail("Setting not found");

          setting.Value = request.Value;
          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }
}
