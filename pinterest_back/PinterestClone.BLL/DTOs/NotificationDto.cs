using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Message { get; set; } = null!;
        
        [Required]
        public NotificationType Type { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public NotificationStatus Status { get; set; }
    }

    public class CreateNotificationDto
    {
        public string UserId { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Title { get; set; }
        public NotificationType Type { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public bool IsSmsEnabled { get; set; } = true;
        public bool IsEmailEnabled { get; set; } = false;
        public bool IsInAppEnabled { get; set; } = true;
        public Guid? PinId { get; set; }
        public Guid? BoardId { get; set; }
        public Guid? CommentId { get; set; }
    }


    public class NotificationSettingsDto
    {
        public bool SmsNotificationsEnabled { get; set; }
        public bool EmailNotificationsEnabled { get; set; }
        public bool InAppNotificationsEnabled { get; set; }
    }
} 