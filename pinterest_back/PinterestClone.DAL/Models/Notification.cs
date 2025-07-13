using System;
using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public enum NotificationType
    {
        // NewPin = 1,
        // PinUpdate = 2,
        // NewBoard = 3,
        // NewComment = 4,
        // NewLike = 5,
        System = 6
    }

    public enum NotificationStatus
    {
        Pending = 1,
        Sent = 2,
        Failed = 3,
        Cancelled = 4
    }

    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string Message { get; set; } = null!;

        [StringLength(100)]
        public string? Title { get; set; }

        public NotificationType Type { get; set; }

        public NotificationStatus Status { get; set; } = NotificationStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ScheduledAt { get; set; }

        public DateTime? SentAt { get; set; }

        public string? ErrorMessage { get; set; }

        public bool IsSmsEnabled { get; set; } = true;

        public bool IsEmailEnabled { get; set; } = false;

        public bool IsInAppEnabled { get; set; } = true;

    
        public Guid? PinId { get; set; }
        public Guid? BoardId { get; set; }
        public Guid? CommentId { get; set; }

        
        public virtual User User { get; set; } = null!;
        public virtual Pin? Pin { get; set; }
        public virtual Board? Board { get; set; }
        public virtual Comment? Comment { get; set; }
    }
} 