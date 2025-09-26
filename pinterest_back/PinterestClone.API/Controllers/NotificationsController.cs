using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.NotificationService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій зі сповіщеннями.
    /// ---------------------------------------
    /// Методи:
    ///     -- Отримати всі сповіщення для користувача
    ///     -- Позначити всі сповіщення користувача як прочитані
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : BaseController
    {
        private readonly INotificationService _notificationService;
        private readonly AppDbContext _context;


        public NotificationsController(INotificationService notificationService, AppDbContext context)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Отримує список сповіщень для користувача.
        /// </summary>
        /// <returns><see cref="ActionResult{ServiceResponse}"/> з колекцією сповіщень або кодом помилки.</returns>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] string type = "all")
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notificationsQuery = _context.Notifications
                .Where(n => n.UserId == userId);

            if (type != "all")
            {
                notificationsQuery = type switch
                {
                    "likes" => notificationsQuery.Where(n => n.Message.Contains("liked")),
                    "comments" => notificationsQuery.Where(n => n.Message.Contains("commented")),
                    "follows" => notificationsQuery.Where(n => n.Message.Contains("following")),
                    "other" => notificationsQuery.Where(n => n.Message.Contains("поділився піном") || n.Type == NotificationType.System),
                    _ => notificationsQuery
                };
            }
            else
            {
                notificationsQuery = notificationsQuery
                    .Where(n => !n.Message.Contains("!"));
            }

            var notifications = await notificationsQuery.ToListAsync();
            return Ok(notifications);
        }

        /// <summary>
        /// Позначає всі сповіщення користувача як прочитані.
        /// </summary>
        /// <returns><see cref="ActionResult{ServiceResponse}"/> з повідомленням про успіх або повідомленням про помилку.</returns>
        [HttpPost("mark-read")]
        public async Task<ActionResult<ServiceResponse>> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var response = await _notificationService.MarkAllAsReadAsync(userId);
            if (response.Success)
            {
                return Ok(response.Message);
            }
            return BadRequest(response.Message);
        }


        /// <summary>
        /// Створює сповіщення про поширення піна.
        /// </summary>
        /// <param name="request">Дані для створення сповіщення (одержувач, ідентифікатор піна, повідомлення).</param>
        /// <returns><see cref="ActionResult{ServiceResponse}"/> з результатом створення сповіщення.</returns>
        [HttpPost("pin-shared")]
        public async Task<ActionResult<ServiceResponse>> CreatePinSharedNotification([FromBody] CreatePinSharedNotificationRequest request)
        {
            var senderUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(senderUserId))
            {
                return Unauthorized();
            }

            var sender = await _context.Users.FindAsync(senderUserId);
            if (sender == null)
            {
                return BadRequest("Відправника не знайдено");
            }

            var senderName = sender.DisplayName ?? sender.UserName ?? sender.Email ?? "Користувач";

            var response = await _notificationService.CreatePinSharedNotificationAsync(
                request.RecipientUserId, 
                request.PinId, 
                senderName, 
                request.Message
            );

            if (response.Success)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }
    }


    public class CreatePinSharedNotificationRequest
    {
        public string RecipientUserId { get; set; } = null!;
        public Guid PinId { get; set; }
        public string? Message { get; set; }
    }
} 