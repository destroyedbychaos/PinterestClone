using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.ProfileReportService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій з скаргами на профілі.
    /// ---------------------------------------------
    /// Методи:
    ///     -- Поскаржитися на профіль
    ///     -- Отримати скаргу по ID
    ///     -- Отримати всі скарги
    ///     -- Вирішити скаргу
    ///     -- Видалити скаргу
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileReportsController : BaseController
    {
        private readonly IProfileReportService _profileReportService;

        public ProfileReportsController(IProfileReportService profileReportService)
        {
            _profileReportService = profileReportService;
        }

        /// <summary>
        /// Створює скаргу на профіль користувача.
        /// </summary>
        /// <param name="reportProfileDto"><see cref="ReportProfileDto"/> з даними скарги.</param>
        /// <returns><see cref="IActionResult"/> зі статусом створення або помилкою.</returns>
        [HttpPost("report")]
        public async Task<IActionResult> ReportProfile([FromBody] ReportProfileDto reportProfileDto)
        {
            Console.WriteLine($"ReportProfile called with ProfileId: '{reportProfileDto?.ProfileId}', ReportMessage: '{reportProfileDto?.ReportMessage}'");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine($"ModelState errors: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(ModelState);
            }
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _profileReportService.ReportProfileAsync(reportProfileDto, userId);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує скаргу за її ID.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="IActionResult"/> зі скаргою або повідомленням про помилку.</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var result = await _profileReportService.GetReportByIdAsync(id);
            return GetResult(result);
        }

        /// <summary>
        /// Отримує список усіх скарг із підтримкою пагінації.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <returns><see cref="IActionResult"/> зі списком скарг або повідомленням про помилку.</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReports([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _profileReportService.GetAllReportsAsync(pageNumber, pageSize);
            return GetResult(result);
        }

        /// <summary>
        /// Позначає скаргу як вирішену та додає нотатки щодо рішення.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <param name="resolutionNotes">Нотатки щодо вирішення скарги.</param>
        /// <returns><see cref="IActionResult"/> зі статусом виконання або повідомленням про помилку.</returns>
        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveReport(int id, [FromBody] string resolutionNotes)
        {
            var result = await _profileReportService.ResolveReportAsync(id, resolutionNotes);
            return GetResult(result);
        }

        /// <summary>
        /// Видаляє скаргу за її ID.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="IActionResult"/> зі статусом видалення або повідомленням про помилку.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var result = await _profileReportService.DeleteReportAsync(id);
            return GetResult(result);
        }
    }
}
