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

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
