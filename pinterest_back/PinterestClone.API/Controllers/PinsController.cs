using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.BLL.Services.ImageService;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PinsController : BaseController
    {
        private readonly IPinService _pinService;
        private readonly PinterestClone.DAL.Data.AppDbContext _db;
        private readonly IImageService _imageService;

        public PinsController(IPinService pinService, PinterestClone.DAL.Data.AppDbContext db, IImageService imageService)
        {
            _pinService = pinService;
            _db = db;
            _imageService = imageService;
        }
        

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

                var (_, fileName, _, _) = await _imageService.SaveImageAsync(createPinDto.ImageFile);
                createPinDto.ImageUrl = _imageService.GetImageUrl(fileName);

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
            [FromQuery] string? tags = null,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetPinsAsync(pageNumber, pageSize, searchTerm, tags, sortBy, isAscending);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pins: {ex.Message}");
            }
        }

        [HttpGet("tags")]
        public async Task<ActionResult<List<string>>> GetAllTags()
        {
            try
            {
                var tags = await _pinService.GetAllTagsAsync();
                return Ok(tags);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting tags: {ex.Message}");
            }
        }

        /// <param name="dto"></param>
        [HttpPost("tags")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<ActionResult> AddTag([FromBody] PinterestClone.BLL.DTOs.TagDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Name))
                return BadRequest("Tag is required");
            var exists = _db.Tags.Any(t => t.Name.ToLower() == dto.Name.ToLower());
            if (exists)
                return Conflict(new { message = "Tag already exists" });
            var tag = new PinterestClone.DAL.Models.Tag { Name = dto.Name };
            _db.Tags.Add(tag);
            await _db.SaveChangesAsync();
            return Ok(new { message = $"Tag '{dto.Name}' added", tag });
        }


        [HttpGet("all-tags")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public ActionResult GetAllTagsCombined()
        {
            var dbTags = _db.Tags.Select(t => t.Name).ToList();
            var pinTags = _db.Pins
                .Where(p => p.Tags != null && p.Tags != "")
                .Select(p => p.Tags)
                .ToList()
                .SelectMany(tags => tags?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Enumerable.Empty<string>())
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();
            var allTags = dbTags.Concat(pinTags).Select(t => t.ToLower()).Distinct().OrderBy(t => t).ToList();
            return Ok(allTags);
        }


        [HttpGet("search")]
        public async Task<ActionResult<PinListDto>> SearchPins(
            [FromQuery] string searchTerm,
            [FromQuery] bool searchInTitle = true,
            [FromQuery] bool searchInDescription = true,
            [FromQuery] bool exactMatch = false,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term is required");
                }

                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.SearchPinsAsync(searchTerm, searchInTitle, searchInDescription, exactMatch, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error searching pins: {ex.Message}");
            }
        }

        [HttpGet("search-by-image-hash")]
        public async Task<ActionResult<PinListDto>> SearchPinsByImageHash(
            [FromQuery] string imageHash,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(imageHash))
                {
                    return BadRequest("Image hash is required");
                }

                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.SearchPinsByImageAsync(imageHash, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error searching pins by image: {ex.Message}");
            }
        }

        [HttpPost("find-similar-images")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PinListDto>> FindSimilarImages([FromForm] FindSimilarImagesDto request)
        {
            try
            {
                if (request.ImageFile == null)
                {
                    return BadRequest("Image file is required");
                }

                var pins = await _pinService.FindSimilarImagesAsync(request.ImageFile);
                return Ok(pins);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error finding similar images: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<PinListDto>> GetUserPins(
            string userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetUserPinsAsync(userId, pageNumber, pageSize, sortBy, isAscending);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user pins: {ex.Message}");
            }
        }

        [HttpGet("board/{boardId}")]
        public async Task<ActionResult<PinListDto>> GetBoardPins(
            string boardId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetBoardPinsAsync(boardId, pageNumber, pageSize, sortBy, isAscending);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting board pins: {ex.Message}");
            }
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

        /// <param name="id"></param>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeletePin(string id)
        {
            var pin = await _db.Pins.FindAsync(Guid.Parse(id));
            if (pin == null)
                return NotFound();
            // Видалити зображення
            if (!string.IsNullOrEmpty(pin.ImageUrl))
            {
                await _imageService.DeleteImageAsync(pin.ImageUrl);
            }
            _db.Pins.Remove(pin);
            await _db.SaveChangesAsync();
            return NoContent();
        }


        /// <param name="id"></param>
        [HttpDelete("tags/{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var tag = await _db.Tags.FindAsync(id);
            if (tag == null)
                return NotFound();
            _db.Tags.Remove(tag);
            await _db.SaveChangesAsync();
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

        [HttpGet("recommendations")]
        public async Task<ActionResult<List<PinRecommendationDto>>> GetRecommendations()
        {
            try
            {
                var recommendedPins = await _pinService.GetRecommendedPinsAsync();
                return Ok(recommendedPins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error loading recommendations: {ex.Message}");
            }
        }

        [HttpPost("search-by-image")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PinListDto>> SearchByImage([FromForm] FindSimilarImagesDto request)
        {
            try
            {
                Console.WriteLine($"SearchByImage called - ImageFile: {request.ImageFile?.FileName}, SearchArea: {request.SearchArea}, SelectionCoords: {request.SelectionCoords}");
                
                if (request.ImageFile == null)
                {
                    Console.WriteLine("ImageFile is null");
                    return BadRequest("Image file is required");
                }

                if (!request.ImageFile.ContentType.StartsWith("image/"))
                {
                    Console.WriteLine($"Invalid content type: {request.ImageFile.ContentType}");
                    return BadRequest("File must be an image");
                }

                Console.WriteLine($"Calling FindSimilarImagesAsync with SearchArea: {request.SearchArea}, SelectionCoords: {request.SelectionCoords}");
                
                
                var similarPins = await _pinService.FindSimilarImagesAsync(request.ImageFile, request.SearchArea, request.SelectionCoords);
                
                Console.WriteLine($"FindSimilarImagesAsync completed, found {similarPins?.Pins?.Count ?? 0} pins");
                
                return Ok(similarPins);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SearchByImage: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error searching by image: {ex.Message}");
            }
        }
    }
} 