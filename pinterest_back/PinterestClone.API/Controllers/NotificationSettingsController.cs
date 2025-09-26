using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.NotificationSettingsService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для керування налаштуваннями сповіщень користувача.
    /// -------------------------------------------------------------
    /// Методи:
    ///     -- Отримання поточних налаштувань сповіщень
    ///     -- Оновлення налаштувань сповіщень
    /// </summary>
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

        /// <summary>
        /// Отримує поточні налаштування сповіщень користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> з налаштуваннями сповіщень або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Оновлює налаштування сповіщень користувача.
        /// </summary>
        /// <param name="dto">Модель з новими налаштуваннями сповіщень.</param>
        /// <returns><see cref="IActionResult"/> з результатом оновлення.</returns>
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
