using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.NotificationService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : BaseController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
            
            if (result.Success)
            {
                return Ok(result.Payload);
            }

            return BadRequest(new { error = result.Message });
        }


        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.GetUnreadNotificationsCountAsync(userId);
            
            if (result.Success)
            {
                return Ok(new { count = result.Payload });
            }

            return BadRequest(new { error = result.Message });
        }


        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.MarkNotificationAsReadAsync(notificationId, userId);
            
            if (result.Success)
            {
                return Ok(new { message = "Повідомлення відмічено як прочитані" });
            }

            return BadRequest(new { error = result.Message });
        }


        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] NotificationSettingsDto settings)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.UpdateNotificationSettingsAsync(userId, settings);
            
            if (result.Success)
            {
                return Ok(new { message = "Налаштування повідомлень оновлено" });
            }

            return BadRequest(new { error = result.Message });
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _notificationService.CreateNotificationAsync(dto);
            
            if (result.Success)
            {
                return Ok(new { message = "Повідомлення створено" });
            }

            return BadRequest(new { error = result.Message });
        }
    }
} 