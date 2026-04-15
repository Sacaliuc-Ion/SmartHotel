namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Auth;

public interface IAuthService
{
     Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
     Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request);
}