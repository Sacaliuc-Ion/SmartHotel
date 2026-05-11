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

          var users = await _db.Context.Users
              .Include(u => u.Role)
              .Where(u => u.Email == normalizedEmail && u.IsActive)
              .OrderBy(u => u.Id)
              .ToListAsync();

          var user = users.FirstOrDefault(existingUser => BCrypt.Net.BCrypt.Verify(request.Password, existingUser.PasswordHash));
          if (user == null)
               return ServiceResult<AuthResponse>.Fail("Invalid credentials.");

          user.LastLoginAt = DateTime.UtcNow;
          _db.Context.UserLoginAudits.Add(new UserLoginAudit
          {
               UserId = user.Id,
               Email = user.Email,
               IpAddress = request.IpAddress,
               UserAgent = request.UserAgent
          });
          await _db.SaveChangesAsync();

          var token = GenerateJwt(user);

          return ServiceResult<AuthResponse>.Ok(new AuthResponse
          {
               Token = token,
               User = MapToUserDto(user)
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

     public async Task<ServiceResult<UserProfileDto>> GetProfileAsync(int userId)
     {
          var user = await _db.Context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
          return user == null
               ? ServiceResult<UserProfileDto>.Fail("User not found.")
               : ServiceResult<UserProfileDto>.Ok(MapToProfileDto(user));
     }

     public async Task<ServiceResult<UserProfileDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request)
     {
          var user = await _db.Context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
          if (user == null)
               return ServiceResult<UserProfileDto>.Fail("User not found.");

          if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
               return ServiceResult<UserProfileDto>.Fail("First name and last name are required.");

          DateOnly? dateOfBirth = null;
          if (!string.IsNullOrWhiteSpace(request.DateOfBirth))
          {
               if (!DateOnly.TryParse(request.DateOfBirth, out var parsedDate))
                    return ServiceResult<UserProfileDto>.Fail("Invalid date of birth format. Use YYYY-MM-DD.");

               dateOfBirth = parsedDate;
          }

          user.FirstName = request.FirstName.Trim();
          user.LastName = request.LastName.Trim();
          user.PhoneNumber = CleanOptional(request.PhoneNumber);
          user.AvatarUrl = CleanOptional(request.AvatarUrl);
          user.Address = CleanOptional(request.Address);
          user.Country = CleanOptional(request.Country);
          user.City = CleanOptional(request.City);
          user.DateOfBirth = dateOfBirth;

          await _db.SaveChangesAsync();
          return ServiceResult<UserProfileDto>.Ok(MapToProfileDto(user));
     }

     public async Task<ServiceResult> ChangePasswordAsync(int userId, ChangePasswordRequest request)
     {
          var user = await _db.Context.Users.FirstOrDefaultAsync(u => u.Id == userId);
          if (user == null)
               return ServiceResult.Fail("User not found.");

          if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
               return ServiceResult.Fail("Current password is incorrect.");

          if (request.NewPassword.Length < 6)
               return ServiceResult.Fail("New password must be at least 6 characters.");

          user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }

     public async Task<ServiceResult<List<LoginAuditDto>>> GetRecentLoginsAsync(int userId)
     {
          var logins = await _db.Context.UserLoginAudits
               .Where(audit => audit.UserId == userId)
               .OrderByDescending(audit => audit.LoggedInAt)
               .Take(5)
               .Select(audit => new LoginAuditDto
               {
                    Id = audit.Id,
                    LoggedInAt = audit.LoggedInAt.ToString("O"),
                    IpAddress = audit.IpAddress,
                    UserAgent = audit.UserAgent
               })
               .ToListAsync();

          return ServiceResult<List<LoginAuditDto>>.Ok(logins);
     }

     public async Task<ServiceResult<List<UserNotificationDto>>> GetNotificationsAsync(int userId)
     {
          await EnsureGeneratedNotificationsAsync(userId);

          var notifications = await _db.Context.UserNotifications
               .Where(notification => notification.UserId == userId)
               .OrderByDescending(notification => notification.CreatedAt)
               .Take(20)
               .Select(notification => new UserNotificationDto
               {
                    Id = notification.Id,
                    ReservationId = notification.ReservationId,
                    Title = notification.Title,
                    Message = notification.Message,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt.ToString("O")
               })
               .ToListAsync();

          return ServiceResult<List<UserNotificationDto>>.Ok(notifications);
     }

     public async Task<ServiceResult> MarkNotificationReadAsync(int notificationId, int userId)
     {
          var notification = await _db.Context.UserNotifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
          if (notification == null)
               return ServiceResult.Fail("Notification not found.");

          notification.IsRead = true;
          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }

     public async Task<ServiceResult> DeleteAccountAsync(int userId)
     {
          var user = await _db.Context.Users.FirstOrDefaultAsync(u => u.Id == userId);
          if (user == null)
               return ServiceResult.Fail("User not found.");

          var hasOperationalRecords = await _db.Context.CheckInRecords.AnyAsync(record => record.ProcessedByUserId == userId)
               || await _db.Context.CheckOutRecords.AnyAsync(record => record.ProcessedByUserId == userId);

          if (hasOperationalRecords)
               return ServiceResult.Fail("This account has operational audit records and cannot be deleted.");

          var assignedTasks = await _db.Context.HousekeepingTasks.Where(task => task.AssignedToUserId == userId).ToListAsync();
          foreach (var task in assignedTasks)
               task.AssignedToUserId = null;

          var assignedTickets = await _db.Context.MaintenanceTickets.Where(ticket => ticket.AssignedToUserId == userId).ToListAsync();
          foreach (var ticket in assignedTickets)
               ticket.AssignedToUserId = null;

          var reportedTickets = await _db.Context.MaintenanceTickets.Where(ticket => ticket.ReportedByUserId == userId).ToListAsync();
          _db.Context.MaintenanceTickets.RemoveRange(reportedTickets);

          var reservations = await _db.Context.Reservations.Where(reservation => reservation.UserId == userId).ToListAsync();
          var affectedRoomIds = reservations.Select(reservation => reservation.RoomId).Distinct().ToList();
          _db.Context.Reservations.RemoveRange(reservations);
          _db.Context.Users.Remove(user);

          await _db.SaveChangesAsync();

          foreach (var roomId in affectedRoomIds)
               await RoomStatusSyncHelper.SyncAsync(_db.Context, roomId);

          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
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

     private static UserDto MapToUserDto(User user) => new()
     {
          Id = user.Id,
          Name = $"{user.FirstName} {user.LastName}",
          Email = user.Email,
          Role = user.Role.Name.ToLower(),
          IsActive = user.IsActive,
          AvatarUrl = user.AvatarUrl
     };

     private static UserProfileDto MapToProfileDto(User user) => new()
     {
          Id = user.Id,
          FirstName = user.FirstName,
          LastName = user.LastName,
          Name = $"{user.FirstName} {user.LastName}",
          Email = user.Email,
          PhoneNumber = user.PhoneNumber,
          AvatarUrl = user.AvatarUrl,
          Role = user.Role.Name.ToLower(),
          IsActive = user.IsActive,
          Address = user.Address,
          Country = user.Country,
          City = user.City,
          DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"),
          CreatedAt = user.CreatedAt.ToString("O"),
          LastLoginAt = user.LastLoginAt?.ToString("O")
     };

     private static string? CleanOptional(string? value)
     {
          return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
     }

     private async Task EnsureGeneratedNotificationsAsync(int userId)
     {
          var today = DateOnly.FromDateTime(DateTime.UtcNow);

          var staleNotifications = await _db.Context.UserNotifications
              .Where(notification =>
                  notification.UserId == userId &&
                  (notification.Title == "Reminder check-in" || notification.Title == "Review pending"))
              .ToListAsync();

          if (staleNotifications.Count > 0)
          {
               var staleReservationIds = staleNotifications
                   .Where(notification => notification.ReservationId.HasValue)
                   .Select(notification => notification.ReservationId!.Value)
                   .Distinct()
                   .ToList();

               if (staleReservationIds.Count > 0)
               {
                    var reservationsById = await _db.Context.Reservations
                        .Include(reservation => reservation.Review)
                        .ToDictionaryAsync(reservation => reservation.Id);

                    var notificationsToRemove = staleNotifications.Where(notification =>
                    {
                         if (!notification.ReservationId.HasValue || !reservationsById.TryGetValue(notification.ReservationId.Value, out var reservation))
                              return true;

                         return notification.Title switch
                         {
                              "Reminder check-in" => reservation.Status != Domain.Enums.ReservationStatus.Confirmed || reservation.CheckInDate < today,
                              "Review pending" => reservation.Status != Domain.Enums.ReservationStatus.CheckedOut || reservation.Review != null,
                              _ => false
                         };
                    }).ToList();

                    if (notificationsToRemove.Count > 0)
                    {
                         _db.Context.UserNotifications.RemoveRange(notificationsToRemove);
                    }
               }
          }

          var upcomingReservations = await _db.Context.Reservations
              .Include(reservation => reservation.Room)
              .Where(reservation =>
                   reservation.UserId == userId &&
                   reservation.Status == Domain.Enums.ReservationStatus.Confirmed &&
                   (reservation.CheckInDate == today || reservation.CheckInDate == today.AddDays(1)))
              .ToListAsync();

          foreach (var reservation in upcomingReservations)
          {
               var title = "Reminder check-in";
               var message = reservation.CheckInDate == today
                    ? $"Astazi este check-in-ul pentru camera {reservation.Room.Number}. Te asteptam la hotel."
                    : $"Maine este check-in-ul pentru camera {reservation.Room.Number}. Pregateste-te pentru sosire.";

               await EnsureNotificationAsync(userId, reservation.Id, title, message);
          }

          var reviewPendingReservations = await _db.Context.Reservations
              .Include(reservation => reservation.Room)
              .Include(reservation => reservation.Review)
              .Where(reservation =>
                   reservation.UserId == userId &&
                   reservation.Status == Domain.Enums.ReservationStatus.CheckedOut &&
                   reservation.Review == null)
              .ToListAsync();

          foreach (var reservation in reviewPendingReservations)
          {
               await EnsureNotificationAsync(
                    userId,
                    reservation.Id,
                    "Review pending",
                    $"Sejurul pentru camera {reservation.Room.Number} s-a incheiat. Lasa un review daca vrei sa ne spui cum a fost."
               );
          }

          await _db.SaveChangesAsync();
     }

     private async Task EnsureNotificationAsync(int userId, int? reservationId, string title, string message)
     {
          var exists = await _db.Context.UserNotifications.AnyAsync(notification =>
               notification.UserId == userId &&
               notification.ReservationId == reservationId &&
               notification.Title == title);

          if (exists)
               return;

          _db.Context.UserNotifications.Add(new UserNotification
          {
               UserId = userId,
               ReservationId = reservationId,
               Title = title,
               Message = message
          });
     }
}
