using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.SocialPermissionsService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для керування соціальними дозволами користувача.
    /// --------------------------------------------------------------------
    /// Методи:
    ///     -- Отримання поточних соціальних дозволів
    ///     -- Оновлення соціальних дозволів
    ///     -- Отримання списку заблокованих користувачів
    ///     -- Блокування користувача
    ///     -- Розблокування користувача
    ///     -- Отримання фільтрів ключових слів
    ///     -- Оновлення фільтрів ключових слів
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SocialPermissionsController : BaseController
    {
        private readonly ISocialPermissionsService _socialPermissionsService;

        public SocialPermissionsController(ISocialPermissionsService socialPermissionsService)
        {
            _socialPermissionsService = socialPermissionsService;
        }

        /// <summary>
        /// Отримує соціальні дозволи користувача.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з поточними соціальними дозволами.
        /// </returns>
        [HttpGet]
        public async Task<IActionResult> GetSocialPermissions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetSocialPermissionsAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Оновлює соціальні дозволи користувача.
        /// </summary>
        /// <param name="dto">Модель із новими параметрами соціальних дозволів.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом оновлення.
        /// </returns>
        [HttpPut]
        public async Task<IActionResult> UpdateSocialPermissions([FromBody] SocialPermissionsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UpdateSocialPermissionsAsync(userId, dto);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує список заблокованих користувачів.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з переліком заблокованих користувачів.
        /// </returns>
        [HttpGet("blocked-users")]
        public async Task<IActionResult> GetBlockedUsers()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetBlockedUsersAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Блокує користувача.
        /// </summary>
        /// <param name="request">Модель з ID користувача для блокування.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом блокування.
        /// </returns>
        [HttpPost("block-user")]
        public async Task<IActionResult> BlockUser([FromBody] BlockUserRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.BlockUserAsync(userId, request.UserId);
            return GetResult(result);
        }

        /// <summary>
        /// Розблоковує користувача.
        /// </summary>
        /// <param name="blockedUserId">ID користувача для розблокування.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом розблокування.
        /// </returns>
        [HttpDelete("unblock-user/{blockedUserId}")]
        public async Task<IActionResult> UnblockUser(string blockedUserId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UnblockUserAsync(userId, blockedUserId);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує фільтри ключових слів користувача.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з переліком фільтрів ключових слів.
        /// </returns>
        [HttpGet("keyword-filters")]
        public async Task<IActionResult> GetKeywordFilters()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetKeywordFiltersAsync(userId);
            return GetResult(result);
        }

        /// <summary>
        /// Оновлює фільтри ключових слів користувача.
        /// </summary>
        /// <param name="dto">Модель з новими фільтрами ключових слів.</param>
        /// <returns>
        /// <see cref="IActionResult"/> з результатом оновлення.
        /// </returns>
        [HttpPut("keyword-filters")]
        public async Task<IActionResult> UpdateKeywordFilters([FromBody] KeywordFilterDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UpdateKeywordFiltersAsync(userId, dto);
            return GetResult(result);
        }
    }

    public class BlockUserRequest
    {
        public string UserId { get; set; }
    }
}
