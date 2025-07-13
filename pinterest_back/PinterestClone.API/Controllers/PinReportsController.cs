using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinReportService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
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


        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var result = await _pinReportService.GetReportByIdAsync(id);
            return GetResult(result);
        }


        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReports([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _pinReportService.GetAllReportsAsync(pageNumber, pageSize);
            return GetResult(result);
        }


        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveReport(int id, [FromBody] string resolutionNotes)
        {
            var result = await _pinReportService.ResolveReportAsync(id, resolutionNotes);
            return GetResult(result);
        }

 
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var result = await _pinReportService.DeleteReportAsync(id);
            return GetResult(result);
        }
    }
} 