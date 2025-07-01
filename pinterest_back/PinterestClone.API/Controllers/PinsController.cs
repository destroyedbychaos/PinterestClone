using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Interfaces;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PinsController : ControllerBase
    {
        private readonly IPinService _pinService;

        public PinsController(IPinService pinService)
        {
            _pinService = pinService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PinResponseDto>> CreatePin([FromBody] CreatePinDto createPinDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var pin = await _pinService.CreatePinAsync(createPinDto, userId);
                return CreatedAtAction(nameof(GetPin), new { id = pin.Id }, pin);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating pin: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PinResponseDto>> GetPin(Guid id)
        {
            try
            {
                var pin = await _pinService.GetPinByIdAsync(id);
                if (pin == null)
                    return NotFound("Pin not found");

                return Ok(pin);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pin: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<PinListDto>> GetPins(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? tags = null)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetPinsAsync(pageNumber, pageSize, searchTerm, tags);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pins: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<PinListDto>> GetUserPins(
            string userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetUserPinsAsync(userId, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user pins: {ex.Message}");
            }
        }

        [HttpGet("board/{boardId}")]
        public async Task<ActionResult<PinListDto>> GetBoardPins(
            Guid boardId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetBoardPinsAsync(boardId, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting board pins: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<PinResponseDto>> UpdatePin(Guid id, [FromBody] UpdatePinDto updatePinDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var pin = await _pinService.UpdatePinAsync(id, updatePinDto, userId);
                if (pin == null)
                    return NotFound("Pin not found or you don't have permission to edit it");

                return Ok(pin);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating pin: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeletePin(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _pinService.DeletePinAsync(id, userId);
                if (!result)
                    return NotFound("Pin not found or you don't have permission to delete it");

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting pin: {ex.Message}");
            }
        }

        [HttpPost("{pinId}/boards/{boardId}")]
        [Authorize]
        public async Task<ActionResult> AddPinToBoard(Guid pinId, Guid boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _pinService.AddPinToBoardAsync(pinId, boardId, userId);
                if (!result)
                    return BadRequest("Failed to add pin to board");

                return Ok(new { message = "Pin successfully added to board" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error adding pin to board: {ex.Message}");
            }
        }

        [HttpDelete("{pinId}/boards/{boardId}")]
        [Authorize]
        public async Task<ActionResult> RemovePinFromBoard(Guid pinId, Guid boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _pinService.RemovePinFromBoardAsync(pinId, boardId, userId);
                if (!result)
                    return BadRequest("Failed to remove pin from board");

                return Ok(new { message = "Pin successfully removed from board" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error removing pin from board: {ex.Message}");
            }
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
} 