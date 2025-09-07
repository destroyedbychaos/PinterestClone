using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinReportService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій з скаргами на піни.
    /// ------------------------------------------
    /// Методи:
    ///     -- Поскаржитися на пін
    ///     -- Отримати скаргу за ID
    ///     -- Отримати список усіх скарг
    ///     -- Вирішити скаргу
    ///     -- Видалити скаргу за ID
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PinReportsController : BaseController
    {
        private readonly IPinReportService _pinReportService;

        public PinReportsController(IPinReportService pinReportService)
        {
            _pinReportService = pinReportService;
        }

        /// <summary>
        /// Створює нову скаргу на пін від імені поточного користувача.
        /// </summary>
        /// <param name="reportPinDto"><see cref="ReportPinDto"/> який містить дані скарги.</param>
        /// <returns><see cref="IActionResult"/> з результатом операції: успіх або помилка.</returns>
        [HttpPost("report")]
        public async Task<IActionResult> ReportPin([FromBody] ReportPinDto reportPinDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _pinReportService.ReportPinAsync(reportPinDto, userId);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує скаргу за ID.Доступно лише для адміністратора.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="IActionResult"/> з даними про скаргу або повідомленням про помилку.</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var result = await _pinReportService.GetReportByIdAsync(id);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує список усіх скарг з підтримкою пагінації. Доступно лише для адміністратора.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням = 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <returns><see cref="IActionResult"/> з колекцією скарг або повідомленням про помилку.</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReports([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _pinReportService.GetAllReportsAsync(pageNumber, pageSize);
            return GetResult(result);
        }

        /// <summary>
        /// Позначає скаргу як вирішену. Доступно лише для адміністратора.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <param name="resolutionNotes"><see cref="string"/>> з нотатками адміністратора щодо вирішення скарги.</param>
        /// <returns><see cref="IActionResult"/> з результатом операції.</returns>
        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveReport(int id, [FromBody] string resolutionNotes)
        {
            var result = await _pinReportService.ResolveReportAsync(id, resolutionNotes);
            return GetResult(result);
        }

        /// <summary>
        /// Видаляє скаргу за ID. Доступно лише для адміністратора.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var result = await _pinReportService.DeleteReportAsync(id);
            return GetResult(result);
        }
    }
} 