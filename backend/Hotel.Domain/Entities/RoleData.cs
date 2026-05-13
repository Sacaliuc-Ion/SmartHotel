using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hotel.Domain.Entities;

public class RoleData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(30, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    public ICollection<UserData> Users { get; set; } = new List<UserData>();
}
