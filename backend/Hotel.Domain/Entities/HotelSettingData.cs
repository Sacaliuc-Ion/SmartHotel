using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class HotelSettingData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Value { get; set; } = string.Empty;

    [StringLength(300)]
    public string? Description { get; set; }
}
