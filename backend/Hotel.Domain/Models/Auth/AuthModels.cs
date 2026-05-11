namespace Hotel.Domain.Models.Auth;

public class LoginRequest
{
     public string Email { get; set; } = string.Empty;
     public string Password { get; set; } = string.Empty;
     public string? IpAddress { get; set; }
     public string? UserAgent { get; set; }
}

public class RegisterRequest
{
     public string FirstName { get; set; } = string.Empty;
     public string LastName { get; set; } = string.Empty;
     public string Email { get; set; } = string.Empty;
     public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
     public string Token { get; set; } = string.Empty;
     public UserDto User { get; set; } = null!;
}

public class UserDto
{
     public int Id { get; set; }
     public string Name { get; set; } = string.Empty;
     public string Email { get; set; } = string.Empty;
     public string Role { get; set; } = string.Empty;
     public bool IsActive { get; set; }
     public string? AvatarUrl { get; set; }
}

public class UserProfileDto
{
     public int Id { get; set; }
     public string FirstName { get; set; } = string.Empty;
     public string LastName { get; set; } = string.Empty;
     public string Name { get; set; } = string.Empty;
     public string Email { get; set; } = string.Empty;
     public string? PhoneNumber { get; set; }
     public string? AvatarUrl { get; set; }
     public string Role { get; set; } = string.Empty;
     public bool IsActive { get; set; }
     public string? Address { get; set; }
     public string? Country { get; set; }
     public string? City { get; set; }
     public string? DateOfBirth { get; set; }
     public string CreatedAt { get; set; } = string.Empty;
     public string? LastLoginAt { get; set; }
}

public class UpdateProfileRequest
{
     public string FirstName { get; set; } = string.Empty;
     public string LastName { get; set; } = string.Empty;
     public string? PhoneNumber { get; set; }
     public string? AvatarUrl { get; set; }
     public string? Address { get; set; }
     public string? Country { get; set; }
     public string? City { get; set; }
     public string? DateOfBirth { get; set; }
}

public class ChangePasswordRequest
{
     public string CurrentPassword { get; set; } = string.Empty;
     public string NewPassword { get; set; } = string.Empty;
}

public class LoginAuditDto
{
     public int Id { get; set; }
     public string LoggedInAt { get; set; } = string.Empty;
     public string? IpAddress { get; set; }
     public string? UserAgent { get; set; }
}

public class UserNotificationDto
{
     public int Id { get; set; }
     public int? ReservationId { get; set; }
     public string Title { get; set; } = string.Empty;
     public string Message { get; set; } = string.Empty;
     public string Category { get; set; } = "general";
     public string? TargetPath { get; set; }
     public bool IsRead { get; set; }
     public string CreatedAt { get; set; } = string.Empty;
}
