using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class SecuritySettings
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public User? User { get; set; }

        public bool GoogleLoginEnabled { get; set; } = true;
        public bool FacebookLoginEnabled { get; set; } = false;
        public bool AppleLoginEnabled { get; set; } = false;

        public bool TwoFactorEnabled { get; set; } = false;
        public bool SmsBackupEnabled { get; set; } = false;
        public bool EmailBackupEnabled { get; set; } = true;

        public bool LoginNotificationsEnabled { get; set; } = true;
        public bool SuspiciousActivityNotifications { get; set; } = true;
        public bool PasswordChangeNotifications { get; set; } = true;

        public bool ShowOnlineStatus { get; set; } = true;
        public bool AllowPasswordReset { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
