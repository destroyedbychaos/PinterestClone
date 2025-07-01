using PinterestClone.DAL.Models.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PinterestClone.DAL.Models
{
    public class RefreshToken
    {
        [Key]
        public required string Id { get; set; }
        [Required]
        [MaxLength(450)]
        public required string Token { get; set; }
        [Required]
        [MaxLength(256)]
        public required string JwtId { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime CreateDate { get; set; }
        public DateTime ExpiredDate { get; set; }

        [ForeignKey("User")]
        public required string UserId { get; set; }
        public User? User { get; set; }
    }
}
