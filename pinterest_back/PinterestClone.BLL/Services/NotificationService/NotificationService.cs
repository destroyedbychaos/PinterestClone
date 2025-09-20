using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.SmsService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.NotificationService
{
    /// <summary>
    /// Сервіс відповідальний за сповіщення
    /// -------------------------------------
    /// Методи:
    ///     -- Отримати сповіщення користувача
    ///     -- Надіслати сповіщення про логін
    ///     -- Позначити всі отримані сповіщення як прочитані
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly ISmsService _smsService;
        private readonly IMapper _mapper;

        public NotificationService(AppDbContext context, ISmsService smsService, IMapper mapper)
        {
            _context = context;
            _smsService = smsService;
            _mapper = mapper;
        }


        public async Task<ServiceResponse> GetUserNotificationsAsync(string userId)
        {
            try
            {
                var notificationDtos = await _context.Notifications
                    .Where(n => n.UserId == userId && n.IsInAppEnabled)
                    .OrderByDescending(n => n.CreatedAt)
                    .ProjectTo<NotificationDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return ServiceResponse.OkResponse("Повідомлення успішно отримано", notificationDtos);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Помилка при отриманні повідомлень: {ex.Message}");
            }
        }

        /// <summary>
        /// Створює сповіщення про успішний вхід користувача та надсилає SMS, якщо дозволено.
        /// </summary>
        /// <param name="userId">Ідентифікатор користувача.</param>
        /// <returns>
        /// Об’єкт <see cref="ServiceResponse"/> з результатом створення сповіщення.
        /// </returns>
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

        /// <summary>
        /// Позначає всі сповіщення користувача як прочитані.
        /// </summary>
        /// <param name="userId">Ідентифікатор користувача.</param>
        /// <returns>
        /// Об’єкт <see cref="ServiceResponse"/> з результатом операції.
        /// </returns>
        /// <exception cref="System.Exception">Викидається у разі помилки доступу до бази даних.</exception>
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


        public async Task<ServiceResponse> CreatePinSharedNotificationAsync(string recipientUserId, Guid pinId, string senderUserName, string? message = null)
        {
            try
            {
                var recipient = await _context.Users.FindAsync(recipientUserId);
                if (recipient == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача-отримувача не знайдено");
                }

                var pin = await _context.Pins.FindAsync(pinId);
                if (pin == null)
                {
                    return ServiceResponse.BadRequestResponse("Пін не знайдено");
                }

                var notificationMessage = $"{senderUserName} поділився піном \"{pin.Title}\" з вами";
                if (!string.IsNullOrEmpty(message))
                {
                    notificationMessage += $": {message}";
                }

                var notification = new Notification
                {
                    UserId = recipientUserId,
                    Message = notificationMessage,
                    Title = "Новий пін поділився з вами",
                    CreatedAt = DateTime.UtcNow,
                    Type = NotificationType.System,
                    Status = NotificationStatus.Sent,
                    IsInAppEnabled = true,
                    IsSmsEnabled = recipient.IsPhoneNumberVerified && recipient.SmsNotificationsEnabled,
                    IsEmailEnabled = false,
                    PinId = pinId
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                if (recipient.IsPhoneNumberVerified && recipient.SmsNotificationsEnabled && !string.IsNullOrEmpty(recipient.PhoneNumber))
                {
                    await _smsService.SendNotificationAsync(recipient.PhoneNumber, notification.Message);
                }

                return ServiceResponse.OkResponse("Повідомлення про поширення піна створено");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Помилка при створенні повідомлення: {ex.Message}");
            }
        }
    }
} 