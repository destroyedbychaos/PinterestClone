using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.Models
{
    public class PasswordResetCode
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Email { get; set; }
        
        [Required]
        public string Code { get; set; }
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 