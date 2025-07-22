using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinShareService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
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

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
