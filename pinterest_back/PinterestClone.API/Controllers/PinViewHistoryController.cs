using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinViewHistoryService;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PinViewHistoryController : BaseController
    {
        private readonly IPinViewHistoryService _pinViewHistoryService;

        public PinViewHistoryController(IPinViewHistoryService pinViewHistoryService)
        {
            _pinViewHistoryService = pinViewHistoryService;
        }

        /// <summary>
        /// Додає перегляд піну до історії переглядів користувача.
        /// </summary>
        /// <param name="addPinViewDto"><see cref="AddPinViewDto"/> з даними про перегляд піну.</param>
        /// <returns><see cref="IActionResult"/> із результатом операції.</returns>
        [HttpPost("add-pin-view")]
        public async Task<IActionResult> AddPinView([FromBody] AddPinViewDto addPinViewDto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.AddPinViewAsync(userId, addPinViewDto);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Отримує історію переглядів користувача з пагінацією.
        /// </summary>
        /// <param name="page">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість записів на сторінці (за замовчуванням 50).</param>
        /// <returns><see cref="IActionResult"/> із результатом запиту.</returns>
        [HttpGet("user-history")]
        public async Task<IActionResult> GetUserViewHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.GetUserViewHistoryAsync(userId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Отримує історію переглядів користувача за вказаною датою.
        /// </summary>
        /// <param name="date">Дата для фільтрації історії переглядів.</param>
        /// <returns><see cref="IActionResult"/> із результатом запиту.</returns>
        [HttpGet("user-history-by-date/{date:datetime}")]
        public async Task<IActionResult> GetUserViewHistoryByDate(DateTime date)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.GetUserViewHistoryByDateAsync(userId, date);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Отримує історію переглядів користувача за вказаним діапазоном дат.
        /// </summary>
        /// <param name="startDate">Початкова дата.</param>
        /// <param name="endDate">Кінцева дата.</param>
        /// <returns><see cref="IActionResult"/> із результатом запиту.</returns>
        [HttpGet("user-history-by-date-range")]
        public async Task<IActionResult> GetUserViewHistoryByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.GetUserViewHistoryByDateRangeAsync(userId, startDate, endDate);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Видаляє всю історію переглядів користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> із результатом операції.</returns>
        [HttpDelete("delete-user-history")]
        public async Task<IActionResult> DeleteUserViewHistory()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.DeleteUserViewHistoryAsync(userId);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Перевіряє, чи переглядав користувач вказаний пін.
        /// </summary>
        /// <param name="pinId">Ідентифікатор піну.</param>
        /// <returns><see cref="IActionResult"/> із результатом перевірки.</returns>
        [HttpGet("has-user-viewed-pin/{pinId:guid}")]
        public async Task<IActionResult> HasUserViewedPin(Guid pinId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.HasUserViewedPinAsync(userId, pinId);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Видаляє дублікати переглядів користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> із результатом операції.</returns>
        [HttpDelete("remove-duplicates")]
        public async Task<IActionResult> RemoveDuplicateViews()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _pinViewHistoryService.RemoveDuplicateViewsAsync(userId);
            
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Отримує ідентифікатор поточного автентифікованого користувача.
        /// </summary>
        /// <returns>ID користувача.</returns>
        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
