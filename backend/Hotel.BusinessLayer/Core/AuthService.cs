using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Models.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Hotel.BusinessLayer.Core;

public class AuthService : IAuthService
{
     private readonly DbSession _db;
     private readonly IConfiguration _config;
     private static readonly ConcurrentDictionary<string, SemaphoreSlim> RegistrationLocks = new(StringComparer.OrdinalIgnoreCase);

     public AuthService(DbSession db, IConfiguration config)
     {
          _db = db;
          _config = config;
     }

     public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
     {
          var normalizedEmail = request.Email.Trim().ToLowerInvariant();

          var user = await _db.Context.Users
              .Include(u => u.Role)
              .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

          if (user == null || !user.IsActive)
               return ServiceResult<AuthResponse>.Fail("Invalid credentials or inactive user.");

          bool validPwd = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
          if (!validPwd)
               return ServiceResult<AuthResponse>.Fail("Invalid credentials.");

          var token = GenerateJwt(user);

          return ServiceResult<AuthResponse>.Ok(new AuthResponse
          {
               Token = token,
               User = new UserDto
               {
                    Id = user.Id,
                    Name = $"{user.FirstName} {user.LastName}",
                    Email = user.Email,
                    Role = user.Role.Name.ToLower(),
                    IsActive = user.IsActive
               }
          });
     }

     public async Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request)
     {
          var normalizedEmail = request.Email.Trim().ToLowerInvariant();
          var emailLock = RegistrationLocks.GetOrAdd(normalizedEmail, _ => new SemaphoreSlim(1, 1));

          await emailLock.WaitAsync();

          try
          {
               if (await _db.Context.Users.AnyAsync(u => u.Email == normalizedEmail))
                    return ServiceResult<AuthResponse>.Fail("Email already in use.");

               var user = new User
               {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Email = normalizedEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    RoleId = 1
               };

               _db.Context.Users.Add(user);
               await _db.SaveChangesAsync();
          }
          finally
          {
               emailLock.Release();
          }

          return await LoginAsync(new LoginRequest
          {
               Email = normalizedEmail,
               Password = request.Password
          });
     }

     private string GenerateJwt(User user)
     {
          var securityKey = new SymmetricSecurityKey(
              Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!)
          );

          var credentials = new SigningCredentials(
              securityKey,
              SecurityAlgorithms.HmacSha256
          );

          var claims = new[]
          {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role.Name.ToLower()),
            new Claim("name", $"{user.FirstName} {user.LastName}")
        };

          var token = new JwtSecurityToken(
              issuer: _config["JwtSettings:Issuer"],
              audience: _config["JwtSettings:Audience"],
              claims: claims,
              expires: DateTime.Now.AddMinutes(
                  int.Parse(_config["JwtSettings:ExpirationMinutes"]!)
              ),
              signingCredentials: credentials
          );

          return new JwtSecurityTokenHandler().WriteToken(token);
     }
}
