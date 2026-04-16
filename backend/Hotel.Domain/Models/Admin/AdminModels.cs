namespace Hotel.Domain.Models.Admin;

public class SettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateSettingRequest
{
    public string Value { get; set; } = string.Empty;
}
