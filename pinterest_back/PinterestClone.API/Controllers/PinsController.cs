using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PinsController : BaseController
    {
        private readonly IPinService _pinService;

        public PinsController(IPinService pinService)
        {
            _pinService = pinService;
        }
        

        /// <summary>
        /// </summary>
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PinResponseDto>> CreatePin([FromForm] CreatePinDto createPinDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");
                
                if (createPinDto.ImageFile == null)
                {
                    return BadRequest("Потрібно вказати файл зображення");
                }

                var pin = await _pinService.CreatePinAsync(createPinDto, userId);
                return Ok(pin);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating pin: {ex.Message}");
            }
        }



        [HttpGet("{id}")]
        public async Task<ActionResult<PinResponseDto>> GetPin(string id)
        {
            var pin = await _pinService.GetPinByIdAsync(id);
            if (pin == null)
                return NotFound("Pin not found");

            return Ok(pin);
        }

        [HttpGet]
        public async Task<ActionResult<PinListDto>> GetPins(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? tags = null)
        {
            if (pageSize > 100) pageSize = 100;
            if (pageNumber < 1) pageNumber = 1;

            var pins = await _pinService.GetPinsAsync(pageNumber, pageSize, searchTerm, tags);
            return Ok(pins);
        }

        ///// <summary>
        ///// </summary>
        //[HttpGet("search")]
        //public async Task<ActionResult<PinListDto>> SearchPins(
        //    [FromQuery] string searchTerm,
        //    [FromQuery] bool searchInTitle = true,
        //    [FromQuery] bool searchInDescription = true,
        //    [FromQuery] bool exactMatch = false,
        //    [FromQuery] int pageNumber = 1,
        //    [FromQuery] int pageSize = 20)
        //{
        //    try
        //    {
        //        if (string.IsNullOrWhiteSpace(searchTerm))
        //        {
        //            return BadRequest("Search term is required");
        //        }

        //        if (pageSize > 100) pageSize = 100;
        //        if (pageNumber < 1) pageNumber = 1;

        //        var pins = await _pinService.SearchPinsAsync(searchTerm, searchInTitle, searchInDescription, exactMatch, pageNumber, pageSize);
        //        return Ok(pins);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"Error searching pins: {ex.Message}");
        //    }
        //}

        ///// <summary>
        ///// </summary>
        //[HttpGet("search-by-image-hash")]
        //public async Task<ActionResult<PinListDto>> SearchPinsByImageHash(
        //    [FromQuery] string imageHash,
        //    [FromQuery] int pageNumber = 1,
        //    [FromQuery] int pageSize = 20)
        //{
        //    try
        //    {
        //        if (string.IsNullOrWhiteSpace(imageHash))
        //        {
        //            return BadRequest("Image hash is required");
        //        }

        //        if (pageSize > 100) pageSize = 100;
        //        if (pageNumber < 1) pageNumber = 1;

        //        var pins = await _pinService.SearchPinsByImageAsync(imageHash, pageNumber, pageSize);
        //        return Ok(pins);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"Error searching pins by image: {ex.Message}");
        //    }
        //}

        ///// <summary>
        ///// </summary>
        //[HttpPost("find-similar-images")]
        //[Consumes("multipart/form-data")]
        //public async Task<ActionResult<PinListDto>> FindSimilarImages([FromForm] FindSimilarImagesDto request)
        //{
        //    try
        //    {
        //        if (request.ImageFile == null)
        //        {
        //            return BadRequest("Image file is required");
        //        }

        //        var pins = await _pinService.FindSimilarImagesAsync(request.ImageFile);
        //        return Ok(pins);
        //    }
        //    catch (ArgumentException ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"Error finding similar images: {ex.Message}");
        //    }
        //}

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<PinListDto>> GetUserPins(string userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageSize > 100) pageSize = 100;
            if (pageNumber < 1) pageNumber = 1;

            var pins = await _pinService.GetUserPinsAsync(userId, pageNumber, pageSize);
            return Ok(pins);
        }

        [HttpGet("board/{boardId}")]
        public async Task<ActionResult<PinListDto>> GetBoardPins(string boardId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageSize > 100) pageSize = 100;
            if (pageNumber < 1) pageNumber = 1;

            var pins = await _pinService.GetBoardPinsAsync(boardId, pageNumber, pageSize);
            return Ok(pins);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<PinResponseDto>> UpdatePin(string id, [FromBody] UpdatePinDto updatePinDto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var pin = await _pinService.UpdatePinAsync(id, updatePinDto, userId);
            if (pin == null)
                return NotFound("Pin not found or you don't have permission to edit it");

            return Ok(pin);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeletePin(string id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _pinService.DeletePinAsync(id, userId);
            if (!result)
                return NotFound("Pin not found or you don't have permission to delete it");

            return NoContent();
        }

        [HttpPost("{pinId}/boards/{boardId}")]
        [Authorize]
        public async Task<ActionResult> AddPinToBoard(string pinId, string boardId)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _pinService.AddPinToBoardAsync(pinId, boardId, userId);
            if (!result)
                return BadRequest("Failed to add pin to board");

            return Ok(new { message = "Pin successfully added to board" });
        }

        [HttpDelete("{pinId}/boards/{boardId}")]
        [Authorize]
        public async Task<ActionResult> RemovePinFromBoard(string pinId, string boardId)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _pinService.RemovePinFromBoardAsync(pinId, boardId, userId);
            if (!result)
                return BadRequest("Failed to remove pin from board");

            return Ok(new { message = "Pin successfully removed from board" });
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
} 