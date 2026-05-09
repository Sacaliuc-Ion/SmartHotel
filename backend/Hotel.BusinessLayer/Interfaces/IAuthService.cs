namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Auth;

public interface IAuthService
{
     Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
     Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request);
     Task<ServiceResult<UserProfileDto>> GetProfileAsync(int userId);
     Task<ServiceResult<UserProfileDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request);
     Task<ServiceResult> ChangePasswordAsync(int userId, ChangePasswordRequest request);
     Task<ServiceResult<List<LoginAuditDto>>> GetRecentLoginsAsync(int userId);
     Task<ServiceResult<List<UserNotificationDto>>> GetNotificationsAsync(int userId);
     Task<ServiceResult> MarkNotificationReadAsync(int notificationId, int userId);
     Task<ServiceResult> DeleteAccountAsync(int userId);
}
