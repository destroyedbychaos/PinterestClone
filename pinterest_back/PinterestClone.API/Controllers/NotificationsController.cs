using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.NotificationService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
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