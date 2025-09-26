using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.SecurityService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для керування безпекою користувача.
    /// ---------------------------------------------
    /// Методи:
    ///     -- Отримання налаштувань безпеки
    ///     -- Оновлення налаштувань безпеки
    ///     -- Отримання активних сесій
    ///     -- Відкликання конкретної сесії
    ///     -- Відкликання всіх інших сесій
    ///     -- Отримання списку підключених додатків
    ///     -- Відкликання доступу підключеного додатку
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SecurityController : BaseController
    {
        private readonly ISecurityService _securityService;

        public SecurityController(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        /// <summary>
        /// Отримує налаштування безпеки користувача.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з поточними налаштуваннями безпеки.
        /// </returns>
        [HttpGet("settings")]
        public async Task<IActionResult> GetSecuritySettings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetSecuritySettingsAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Оновлює налаштування безпеки користувача.
        /// </summary>
        /// <param name="dto">Модель із новими параметрами безпеки.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом оновлення налаштувань.
        /// </returns>
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSecuritySettings([FromBody] SecuritySettingsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.UpdateSecuritySettingsAsync(userId, dto);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує список активних сесій користувача.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з переліком активних сесій.
        /// </returns>
        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetUserSessionsAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Відкликає вказану сесію користувача.
        /// </summary>
        /// <param name="sessionId">Ідентифікатор сесії для відкликання.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом відкликання.
        /// </returns>
        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> RevokeSession(int sessionId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.RevokeSessionAsync(userId, sessionId);
            return GetResult(result);
        }

        /// <summary>
        /// Відкликає всі інші сесії користувача, крім поточної.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом відкликання сесій.
        /// </returns>
        [HttpPost("sessions/revoke-others")]
        public async Task<IActionResult> RevokeAllOtherSessions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var currentSessionId = HttpContext.TraceIdentifier; 

            var result = await _securityService.RevokeAllOtherSessionsAsync(userId, currentSessionId);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує список підключених додатків користувача.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з переліком підключених додатків.
        /// </returns>
        [HttpGet("connected-apps")]
        public async Task<IActionResult> GetConnectedApps()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetConnectedAppsAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Відкликає доступ підключеного додатку користувача.
        /// </summary>
        /// <param name="appId">ID додатку.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом відкликання доступу.
        /// </returns>
        [HttpDelete("connected-apps/{appId}")]
        public async Task<IActionResult> RevokeAppAccess(int appId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.RevokeAppAccessAsync(userId, appId);
            return GetResult(result);
        }
    }
}
