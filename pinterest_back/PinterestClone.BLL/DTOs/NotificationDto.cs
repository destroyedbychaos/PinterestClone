using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для сповіщення.
    /// </summary>
    public class NotificationDto
    {
        /// <summary>
        /// ID сповіщення.
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Контент сповіщення.
        /// </summary>
        [Required]
        public string Message { get; set; } = null!;
        
        /// <summary>
        /// Тип сповіщення.
        /// </summary>
        [Required]
        public NotificationType Type { get; set; }
        
        /// <summary>
        /// Коли створене сповіщення.
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// Статус сповіщення.
        /// </summary>
        public NotificationStatus Status { get; set; }
    }

    /// <summary>
    /// Data Transfer Object для створення сповіщення.
    /// </summary>
    public class CreateNotificationDto
    {
        /// <summary>
        /// ID користувача.
        /// </summary>
        public string UserId { get; set; } = null!;

        /// <summary>
        /// Вміст сповіщення.
        /// </summary>
        public string Message { get; set; } = null!;

        /// <summary>
        /// Назва сповіщення.
        /// </summary>
        public string? Title { get; set; }

        /// <summary>
        /// Тип сповіщення.
        /// </summary>
        public NotificationType Type { get; set; }

        /// <summary>
        /// Коли надіслати сповіщення.
        /// </summary>
        public DateTime? ScheduledAt { get; set; }

        /// <summary>
        /// Чи ввімкнені СМС-сповіщення у користувача.
        /// </summary>
        public bool IsSmsEnabled { get; set; } = true;

        /// <summary>
        /// Чи ввімкнені email-сповіщення у користувача.
        /// </summary>
        public bool IsEmailEnabled { get; set; } = false;

        /// <summary>
        /// Чи ввімкнені in-app сповіщення у користувача.
        /// </summary>
        public bool IsInAppEnabled { get; set; } = true;

        /// <summary>
        /// ID піна, про який є сповіщення.
        /// </summary>
        public Guid? PinId { get; set; }

        /// <summary>
        /// ID дошки, про яку є сповіщення.
        /// </summary>
        public Guid? BoardId { get; set; }

        /// <summary>
        /// ID коментаря, про який є сповіщення.
        /// </summary>
        public Guid? CommentId { get; set; }
    }

    /// <summary>
    /// Data Transfer Object для налаштувань сповіщень.
    /// </summary>
    public class NotificationSettingsDto
    {
        /// <summary>
        /// Чи ввімкнені СМС-сповіщення у користувача.
        /// </summary>
        public bool SmsNotificationsEnabled { get; set; }

        /// <summary>
        /// Чи ввімкнені email-сповіщення у користувача.
        /// </summary>
        public bool EmailNotificationsEnabled { get; set; }

        /// <summary>
        /// Чи ввімкнені In-App сповіщення у користувача.
        /// </summary>
        public bool InAppNotificationsEnabled { get; set; }
    }
} 