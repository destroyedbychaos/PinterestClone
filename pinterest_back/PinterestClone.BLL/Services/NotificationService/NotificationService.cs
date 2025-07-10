using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.SmsService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.BLL.Services.NotificationService
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly ISmsService _smsService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(AppDbContext context, ISmsService smsService, ILogger<NotificationService> logger)
        {
            _context = context;
            _smsService = smsService;
            _logger = logger;
        }

        public async Task<ServiceResponse> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = createDto.UserId,
                    Message = createDto.Message,
                    Title = createDto.Title,
                    Type = createDto.Type,
                    ScheduledAt = createDto.ScheduledAt ?? DateTime.UtcNow,
                    IsSmsEnabled = createDto.IsSmsEnabled,
                    IsEmailEnabled = createDto.IsEmailEnabled,
                    IsInAppEnabled = createDto.IsInAppEnabled,
                    PinId = createDto.PinId,
                    BoardId = createDto.BoardId,
                    CommentId = createDto.CommentId,
                    Status = NotificationStatus.Pending
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created notification {NotificationId} for user {UserId}", notification.Id, createDto.UserId);
                
                return ServiceResponse.OkResponse("Повідомлення створено", notification.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", createDto.UserId);
                return ServiceResponse.InternalServerErrorResponse("Помилка створення повідомлення");
            }
        }

        public async Task<ServiceResponse> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 20)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && n.IsInAppEnabled)
                    .OrderByDescending(n => n.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(n => new NotificationDto
                    {
                        Id = n.Id,
                        Message = n.Message,
                        Title = n.Title,
                        Type = n.Type,
                        Status = n.Status,
                        CreatedAt = n.CreatedAt,
                        ScheduledAt = n.ScheduledAt,
                        SentAt = n.SentAt,
                        ErrorMessage = n.ErrorMessage,
                        IsSmsEnabled = n.IsSmsEnabled,
                        IsEmailEnabled = n.IsEmailEnabled,
                        IsInAppEnabled = n.IsInAppEnabled,
                        PinId = n.PinId,
                        BoardId = n.BoardId,
                        CommentId = n.CommentId
                    })
                    .ToListAsync();

                return ServiceResponse.OkResponse("Повідомлення отримано", notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка отримання повідомлення");
            }
        }

        public async Task<ServiceResponse> SendPendingNotificationsAsync()
        {
            try
            {
                var pendingNotifications = await _context.Notifications
                    .Include(n => n.User)
                    .Where(n => n.Status == NotificationStatus.Pending &&
                               n.ScheduledAt <= DateTime.UtcNow)
                    .ToListAsync();

                foreach (var notification in pendingNotifications)
                {
                    await ProcessNotificationAsync(notification);
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Processed {Count} pending notifications", pendingNotifications.Count);
                
                return ServiceResponse.OkResponse("Відкладені повідомлення відправлені", pendingNotifications.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending pending notifications");
                return ServiceResponse.InternalServerErrorResponse("Помилка відправлення повідомлень");
            }
        }

        private async Task ProcessNotificationAsync(Notification notification)
        {
            try
            {
                bool success = true;
                var errors = new List<string>();

                
                if (notification.IsSmsEnabled && 
                    notification.User.IsPhoneNumberVerified && 
                    notification.User.SmsNotificationsEnabled &&
                    !string.IsNullOrEmpty(notification.User.PhoneNumber))
                {
                    var smsResult = await _smsService.SendNotificationAsync(notification.User.PhoneNumber, notification.Message);
                    if (!smsResult.Success)
                    {
                        success = false;
                        errors.Add($"SMS: {smsResult.Message}");
                    }
                }

                if (success)
                {
                    notification.Status = NotificationStatus.Sent;
                    notification.SentAt = DateTime.UtcNow;
                }
                else
                {
                    notification.Status = NotificationStatus.Failed;
                    notification.ErrorMessage = string.Join("; ", errors);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification {NotificationId}", notification.Id);
                notification.Status = NotificationStatus.Failed;
                notification.ErrorMessage = ex.Message;
            }
        }

        public async Task<ServiceResponse> NotifyNewPinAsync(string userId, Guid pinId, string pinTitle)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = userId,
                Message = $"Нова картинка добавлена: {pinTitle}",
                Title = "Нова картинка",
                Type = NotificationType.NewPin,
                PinId = pinId
            };

            return await CreateNotificationAsync(createDto);
        }

        public async Task<ServiceResponse> NotifyPinUpdateAsync(string userId, Guid pinId, string pinTitle)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = userId,
                Message = $"Картинка оновлена: {pinTitle}",
                Title = "Оновлення картинки",
                Type = NotificationType.PinUpdate,
                PinId = pinId
            };

            return await CreateNotificationAsync(createDto);
        }

        public async Task<ServiceResponse> NotifyNewCommentAsync(string userId, Guid pinId, string commentText)
        {
            var shortComment = commentText.Length > 50 ? commentText.Substring(0, 50) + "..." : commentText;
            
            var createDto = new CreateNotificationDto
            {
                UserId = userId,
                Message = $"Новий коментар: {shortComment}",
                Title = "Новий коментар",
                Type = NotificationType.NewComment,
                PinId = pinId
            };

            return await CreateNotificationAsync(createDto);
        }

        public async Task<ServiceResponse> NotifyNewLikeAsync(string userId, Guid pinId)
        {
            var createDto = new CreateNotificationDto
            {
                UserId = userId,
                Message = "Ваша картинка сподобалася користувачу",
                Title = "Вашу картинку вподобали",
                Type = NotificationType.NewLike,
                PinId = pinId
            };

            return await CreateNotificationAsync(createDto);
        }

        public async Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, NotificationSettingsDto settings)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                user.SmsNotificationsEnabled = settings.SmsNotificationsEnabled;

                await _context.SaveChangesAsync();
                
                return ServiceResponse.OkResponse("Налаштування сповіщення оновлено");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification settings for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка оновлення налаштувань повідомлень");
            }
        }

        public async Task<ServiceResponse> MarkNotificationAsReadAsync(int notificationId, string userId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                {
                    return ServiceResponse.BadRequestResponse("Повідомлення не знайдено ");
                }

                
                await _context.SaveChangesAsync();
                
                return ServiceResponse.OkResponse("Повідомлення відмічено як прочитане");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                return ServiceResponse.InternalServerErrorResponse("Помилка оновлення повідомлень");
            }
        }

        public async Task<ServiceResponse> GetUnreadNotificationsCountAsync(string userId)
        {
            try
            {
                var count = await _context.Notifications
                    .CountAsync(n => n.UserId == userId && 
                               n.IsInAppEnabled && 
                               n.Status == NotificationStatus.Sent);

                return ServiceResponse.OkResponse("Кількість непрочтаних повідомлень", count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread notifications count for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("помилка отримання кількості непрочитаних повідомлень");
            }
        }
    }
} 