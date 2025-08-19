using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.ProfileReportService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
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

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var result = await _profileReportService.GetReportByIdAsync(id);
            return GetResult(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReports([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _profileReportService.GetAllReportsAsync(pageNumber, pageSize);
            return GetResult(result);
        }

        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveReport(int id, [FromBody] string resolutionNotes)
        {
            var result = await _profileReportService.ResolveReportAsync(id, resolutionNotes);
            return GetResult(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var result = await _profileReportService.DeleteReportAsync(id);
            return GetResult(result);
        }
    }
}
