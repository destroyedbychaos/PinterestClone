using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class UserSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public User? User { get; set; }

        [Required]
        public required string SessionId { get; set; }

        [Required]
        public required string DeviceName { get; set; }

        public string? DeviceType { get; set; }

        public string? OperatingSystem { get; set; } 

        public string? Browser { get; set; } 

        public string? IpAddress { get; set; }

        public string? Location { get; set; } 

        public bool IsActive { get; set; } = true;

        public bool IsCurrent { get; set; } = false; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

        public DateTime? RevokedAt { get; set; }
    }
}
