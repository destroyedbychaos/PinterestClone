using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.BLL.Services.SmsService;

namespace PinterestClone.BLL.Services.NotificationService
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly ISmsService _smsService;

        public NotificationService(
            AppDbContext context,
            ISmsService smsService)
        {
            _context = context;
            _smsService = smsService;
        }

        private static NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Message = notification.Message,
                Type = notification.Type,
                CreatedAt = notification.CreatedAt,
                Status = notification.Status
            };
        }

        public async Task<ServiceResponse> GetUserNotificationsAsync(string userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && n.IsInAppEnabled)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                var notificationDtos = notifications.Select(MapToDto).ToList();
                return ServiceResponse.OkResponse("Повідомлення успішно отримано", notificationDtos);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Помилка при отриманні повідомлень: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> CreateLoginNotificationAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                var notification = new Notification
                {
                    UserId = userId,
                    Message = "Ласкаво просимо! Ви успішно увійшли в систему.",
                    CreatedAt = DateTime.UtcNow,
                    Type = NotificationType.System,
                    Status = NotificationStatus.Sent,
                    IsInAppEnabled = true,
                    IsSmsEnabled = user.IsPhoneNumberVerified && user.SmsNotificationsEnabled,
                    IsEmailEnabled = false
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                if (user.IsPhoneNumberVerified && user.SmsNotificationsEnabled && !string.IsNullOrEmpty(user.PhoneNumber))
                {
                    await _smsService.SendNotificationAsync(user.PhoneNumber, notification.Message);
                }

                return ServiceResponse.OkResponse("Повідомлення про вхід створено");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Помилка при створенні повідомлення: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> MarkAllAsReadAsync(string userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && n.Status != NotificationStatus.Sent)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.Status = NotificationStatus.Sent;
                }

                await _context.SaveChangesAsync();
                return ServiceResponse.OkResponse("Всі повідомлення позначено як прочитані");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Помилка при позначенні повідомлень як прочитаних: {ex.Message}");
            }
        }
    }
} 