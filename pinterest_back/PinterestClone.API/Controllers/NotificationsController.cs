using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.NotificationService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій зі сповіщеннями.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : BaseController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Отримує список сповіщень для користувача.
        /// </summary>
        /// <returns><see cref="ActionResult{ServiceResponse}"/> з колекцією сповіщень або кодом помилки.</returns>
        [HttpGet]
        public async Task<ActionResult<ServiceResponse>> GetUserNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var response = await _notificationService.GetUserNotificationsAsync(userId);
            if (response.Success)
            {
                return Ok(response.Payload);
            }
            return BadRequest(response.Message);
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
    }
} 