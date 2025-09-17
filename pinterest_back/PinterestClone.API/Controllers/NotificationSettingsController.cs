using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.NotificationSettingsService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationSettingsController : BaseController
    {
        private readonly INotificationSettingsService _notificationSettingsService;

        public NotificationSettingsController(INotificationSettingsService notificationSettingsService)
        {
            _notificationSettingsService = notificationSettingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotificationSettings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationSettingsService.GetNotificationSettingsAsync(userId);
            return GetResult(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateNotificationSettings([FromBody] NotificationSettingsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _notificationSettingsService.UpdateNotificationSettingsAsync(userId, dto);
            return GetResult(result);
        }
    }
}
