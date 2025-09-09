using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinShareService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій з поширенням пінів.
    /// ------------------------------------------
    /// Методи:
    ///     -- Поширити пін
    ///     -- Отримати поширення піна
    ///     -- Позначити як поширене
    ///     -- Видалити поширення піна
    ///     -- Отримати кількість поширених пінів
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PinSharesController : ControllerBase
    {
        private readonly IPinShareService _pinShareService;

        public PinSharesController(IPinShareService pinShareService)
        {
            _pinShareService = pinShareService;
        }

        /// <summary>
        /// Дозволяє користувачу поділитися піном з іншими.
        /// </summary>
        /// <param name="sharePinDto"><see cref="SharePinDto"/> з даними про поширення піна.</param>
        /// <returns><see cref="ActionResult{PinShareResponseDto}"/> з інформацією про успішне поширення або повідомленням про помилку.</returns>
        [HttpPost]
        public async Task<ActionResult<PinShareResponseDto>> SharePin([FromBody] SharePinDto sharePinDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var result = await _pinShareService.SharePinAsync(sharePinDto, userId);
                if (!result.Success)
                    return BadRequest(result.Message);

                return Ok(result.Payload);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error sharing pin: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримує деталі поширення піна за ID.
        /// </summary>
        /// <param name="id">ID поширення піна.</param>
        /// <returns><see cref="ActionResult{PinShareResponseDto}"/> з інформацією про поширення піна або повідомленням про помилку.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<PinShareResponseDto>> GetPinShare(int id)
        {
            try
            {
                var result = await _pinShareService.GetPinShareByIdAsync(id);
                if (!result.Success)
                    return NotFound(result.Message);

                return Ok(result.Payload);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pin share: {ex.Message}");
            }
        }

        /// <summary>
        /// Позначає поширення піна як прочитане для поточного користувача.
        /// </summary>
        /// <param name="id">ID поширення піна.</param>
        /// <returns><see cref="ActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpPut("{id}/mark-as-read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var result = await _pinShareService.MarkAsReadAsync(id, userId);
                if (!result.Success)
                    return BadRequest(result.Message);

                return Ok(new { message = "Marked as read successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error marking as read: {ex.Message}");
            }
        }

        /// <summary>
        /// Видаляє поширення піна для поточного користувача.
        /// </summary>
        /// <param name="id">ID поширення піна.</param>
        /// <returns><see cref="ActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePinShare(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var result = await _pinShareService.DeletePinShareAsync(id, userId);
                if (!result.Success)
                    return BadRequest(result.Message);

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting pin share: {ex.Message}");
            }
        }

        /// <summary>
        /// Повертає кількість непрочитаних поширень піна для поточного користувача.
        /// </summary>
        /// <returns><see cref="ActionResult{int}"/> з кількістю непрочитаних поширень або повідомленням про помилку.</returns>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var result = await _pinShareService.GetUnreadCountAsync(userId);
                if (!result.Success)
                    return BadRequest(result.Message);

                return Ok(result.Payload);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting unread count: {ex.Message}");
            }
        }

        /// <summary>
        /// Повертає ID поточного користувача з токена.
        /// </summary>
        /// <returns>Рядок з ID користувача або <c>null</c>, якщо користувач не аутентифікований.</returns>
        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
