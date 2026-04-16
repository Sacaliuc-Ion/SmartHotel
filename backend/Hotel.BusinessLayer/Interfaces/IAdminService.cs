namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Admin;
using Hotel.Domain.Models.Auth;

public interface IAdminService
{
     Task<ServiceResult<List<UserDto>>> GetUsersAsync();
     Task<ServiceResult> ToggleUserActiveAsync(int userId);
     Task<ServiceResult<List<SettingDto>>> GetSettingsAsync();
     Task<ServiceResult> UpdateSettingAsync(string key, UpdateSettingRequest request);
}
