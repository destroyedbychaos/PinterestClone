using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class BlockedUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string BlockerId { get; set; } 

        [Required]
        public required string BlockedId { get; set; } 

        public User? Blocker { get; set; }
        public User? Blocked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
