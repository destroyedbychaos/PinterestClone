using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class KeywordFilter
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public User? User { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Keyword { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
