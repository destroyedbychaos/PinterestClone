using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.ImageService;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.DAL.Models;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для операцій з пінами.
    /// --------------------------------
    /// Методи:
    ///     -- Створити пін
    ///     -- Отримати пін за ID
    ///     -- Отримати список всіх пінів
    ///     -- Отримати список пінів певного користувача
    ///     -- Отримати всі теги, що використовуються в пінах
    ///     -- Додати тег
    ///     -- Отримати всі теги як список
    ///     -- Шукати піни
    ///     -- Шукати картинку за хешом
    ///     -- Знайти подібні картинки
    ///     -- Отримати список пінів певної дошки
    ///     -- Оновити пін
    ///     -- Видалити пін
    ///     -- Видалити тег
    ///     -- Додати пін до дошки
    ///     -- Видалити пін з дошки
    ///     -- Отримати рекомендації пінів
    ///     -- Отримати поради за пошуком
    ///     -- Шукати по картинці
    /// </summary>
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

        /// <summary>
        /// Створює новий пін з завантаженою картинкою.
        /// </summary>
        /// <param name="createPinDto"><see cref="CreatePinDto"/> з даними піна.</param>
        /// <returns><see cref="ActionResult{PinResponseDto}"/> з інформацією про створений пін або повідомленням про помилку.</returns>
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
                    return BadRequest("Image file is required");

                var pin = await _pinService.CreatePinAsync(createPinDto, userId, createPinDto.ImageFile);
                if (pin == null)
                    return BadRequest("Failed to create pin");

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



        [HttpGet("{pinId}/similar-by-tags")]
        public async Task<ActionResult<PinListDto>> GetSimilarPinsByTags(
            string pinId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetSimilarPinsByTagsAsync(pinId, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting similar pins by tags: {ex.Message}");
            }
        }

        [HttpGet("{pinId}/similar-by-image")]
        public async Task<ActionResult<PinListDto>> GetSimilarPinsByImage(
            string pinId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetSimilarPinsByImageAsync(pinId, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting similar pins by image: {ex.Message}");
            }
        }

        [HttpGet("{pinId}/recommendations")]
        public async Task<ActionResult<PinListDto>> GetPinRecommendations(
            string pinId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetPinRecommendationsAsync(pinId, pageNumber, pageSize);
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pin recommendations: {ex.Message}");
            }
        }


        /// <summary>
        /// Отримує пін за його ID.
        /// </summary>
        /// <param name="id">ID піна.</param>
        /// <returns><see cref="ActionResult{PinResponseDto}"/> з даними піна або повідомленням про помилку.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<PinResponseDto>> GetPin(string id)
        {
            var pin = await _pinService.GetPinByIdAsync(id);
            if (pin == null)
                return NotFound("Pin not found");

            return Ok(pin);
        }

        /// <summary>
        /// Отримує список всіх пінів із підтримкою пагінації, пошуку та сортування.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки, ціле число (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці, ціле число (за замовчуванням 20).</param>
        /// <param name="searchTerm">Термін пошуку у заголовку або описі (опційно).</param>
        /// <param name="tags">Список тегів для фільтрації (опційно).</param>
        /// <param name="sortBy">Поле для сортування (за замовчуванням = "createdAt").</param>
        /// <param name="isAscending">Сортування за зростанням (true/false).</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Повертає список пінів, створених конкретним користувачем, з підтримкою пагінації та сортування.
        /// </summary>
        /// <param name="userId">ID користувача.</param>
        /// <param name="pageNumber">Номер сторінки для пагінації (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (за замовчуванням = "createdAt").</param>
        /// <param name="isAscending"><c>True</c> — сортування за зростанням, <c>False</c> — сортування за спаданням.</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів користувача або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Повертає список усіх тегів, що використовуються в пiнах.
        /// </summary>
        /// <returns><see cref="ActionResult{List{string}}"/> зі списком тегів або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Додає тег у базу даних.
        /// </summary>
        /// <param name="dto"><see cref="TagDto"/> з ім’ям тегу.</param>
        /// <returns><see cref="ActionResult"/> з повідомленням про успішне додавання або помилку.</returns>
        [HttpPost("tags")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<ActionResult> AddTag([FromBody] TagDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Name))
                return BadRequest("Tag is required");
            var exists = _db.Tags.Any(t => t.Name.ToLower() == dto.Name.ToLower());
            if (exists)
                return Conflict(new { message = "Tag already exists" });
            var tag = new DAL.Models.Tag { Name = dto.Name };
            _db.Tags.Add(tag);
            await _db.SaveChangesAsync();
            return Ok(new { message = $"Tag '{dto.Name}' added", tag });
        }

        /// <summary>
        /// Повертає всі доступні теги з бази даних.
        /// </summary>
        /// <returns><see cref="ActionResult{List{string}}"/> зі списком тегів у нижньому регістрі, без дублікатів.</returns>   
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

        /// <summary>
        /// Шукає за ключовим словом із можливістю фільтрації за заголовком та описом.
        /// </summary>
        /// <param name="searchTerm">Ключове слово для пошуку пінів.</param>
        /// <param name="searchInTitle"> Чи шукати в заголовках пінів.</param>
        /// <param name="searchInDescription">Чи шукати в описах пінів.</param>
        /// <param name="exactMatch">Чи виконувати точне співпадіння рядка.</param>
        /// <param name="pageNumber"> Номер сторінки для пагінації (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінку (за замовчуванням 20).</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів, що відповідають критеріям пошуку або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Шукає піни за хешем зображення.
        /// </summary>
        /// <param name="imageHash">Хеш зображення.</param>
        /// <param name="pageNumber">Номер сторінки для пагінації результатів (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінку (за замовчуванням 20).</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів, що відповідають хешу зображення або повідомлення про помилку.</returns>
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

        /// <summary>
        /// Шукає піни за зображенням.
        /// </summary>
        /// <param name="request"><see cref="FindSimilarImagesDto"/> з файлом зображення та параметрами пошуку.</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком схожих пінів або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Отримання списку пінів певної дошки.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="pageNumber">Номер сторінки для пагінації результаті (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінку (за замовчуванням 20).</param>
        /// <param name="sortBy"> Поле для сортування пінів (за замовчуванням "createdAt").</param>
        /// <param name="isAscending"> Вказує порядок сортування: <c>True</c> — за зростанням, <c>False</c> — за спаданням.</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів для вказаної дошки або повідомленням про помилку.</returns>
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


        /// <summary>
        /// Оновлює дані піна.
        /// </summary>
        /// <param name="id">ID піна.</param>
        /// <param name="updatePinDto"><see cref="UpdatePinDto"/> з новими даними піна.</param>
        /// <returns><see cref="ActionResult{PinResponseDto}"/> з оновленим піном або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Видаляє пін за його ID.
        /// </summary>
        /// <param name="id">ID піна.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeletePin(string id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var deleted = await _pinService.DeletePinAsync(id, userId);
            if (!deleted)
                return NotFound("Pin not found or you don't have permission to delete it");

            return NoContent();
        }


        /// <summary>
        /// Видаляє тег за його ID.
        /// </summary>
        /// <param name="id">ID тегу.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
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

        /// <summary>
        /// Додає пін до дошки користувача.
        /// </summary>
        /// <param name="pinId">ID піна, який потрібно додати.</param>
        /// <param name="boardId">ID дошки, до якої додається пін.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
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

        /// <summary>
        /// Видаляє пін з дошки користувача.
        /// </summary>
        /// <param name="pinId">ID піна, який потрібно видалити.</param>
        /// <param name="boardId">ID дошки, з якої видаляється пін.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
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

        /// <summary>
        /// Отримує ID поточного аутентифікованого користувача з токена. Внутрішній метод.
        /// </summary>
        /// <returns>Рядок з ID користувача або <c>null</c>, якщо користувач не аутентифікований.</returns>
        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        /// <summary>
        /// Повертає список рекомендованих пінів для користувача.
        /// </summary>
        /// <returns><see cref="ActionResult{List{PinRecommendationDto}}"/> зі списком рекомендованих пінів або повідомленням про помилку.</returns>
        [HttpGet("recommendations")]
        [Authorize]
        public async Task<ActionResult<List<PinRecommendationDto>>> GetRecommendations()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var recommendedPins = await _pinService.GetRecommendedPinsAsync(userId);
                return Ok(recommendedPins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error loading recommendations: {ex.Message}");
            }
        }

        [HttpGet("recommendations/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<PinRecommendationDto>>> GetRecommendationsForUser(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    return BadRequest("UserId is required");

                var recommendedPins = await _pinService.GetRecommendedPinsAsync(userId);
                return Ok(recommendedPins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error loading recommendations for user {userId}: {ex.Message}");
            }
        }


        /// <summary>
        /// Повертає список підказок для пошукового запиту.
        /// </summary>
        /// <param name="q">Рядок запиту для пошуку порад пінів.</param>
        /// <returns><see cref="IActionResult"/> зі списком пораджених пінів.</returns>
        [HttpGet("search-suggestions")]
        public async Task<IActionResult> GetSearchSuggestions([FromQuery] string q)
        {
            var suggestions = await _pinService.GetSearchSuggestionsAsync(q);
            return Ok(suggestions);
        }

        /// <summary>
        /// Виконує пошук пінів за завантаженим зображенням.
        /// </summary>
        /// <param name="request"><see cref="FindSimilarImagesDto"/>, який містить файл зображення, область пошуку та координати виділення.</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів, схожих на завантажене зображення, або повідомленням про помилку.</returns>
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

        [HttpGet("{pinId}/likes")]
        public async Task<ActionResult<object>> GetPinLikes(string pinId)
        {
            try
            {
                var likesCount = await _db.Likes.CountAsync(l => l.PinId.ToString() == pinId);
                var userId = GetCurrentUserId();
                var isLiked = false;
                
                if (!string.IsNullOrEmpty(userId))
                {
                    isLiked = await _db.Likes.AnyAsync(l => l.PinId.ToString() == pinId && l.UserId == userId);
                }

                return Ok(new
                {
                    likesCount,
                    isLiked
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting pin likes: {ex.Message}");
            }
        }

        [HttpPost("{pinId}/like")]
        [Authorize]
        public async Task<ActionResult<object>> TogglePinLike(string pinId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var existingLike = await _db.Likes
                    .FirstOrDefaultAsync(l => l.PinId.ToString() == pinId && l.UserId == userId);

                bool isLiked;

                if (existingLike != null)
                {
                    _db.Likes.Remove(existingLike);
                    isLiked = false;
                }
                else
                {
                    var like = new PinterestClone.DAL.Models.Like
                    {
                        Id = Guid.NewGuid(),
                        PinId = Guid.Parse(pinId),
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Likes.Add(like);
                    isLiked = true;

                    var pin = await _db.Pins.Include(p => p.User)
                                            .FirstOrDefaultAsync(p => p.Id.ToString() == pinId);

                    if (pin != null && pin.UserId != userId) 
                    {
                        var sender = await _db.Users.FindAsync(userId);

                        var notification = new Notification
                        {
                            UserId = pin.UserId, 
                            Message = $"{sender?.UserName ?? "Someone"} liked your Aest",
                            Title = "New Like ❤️",
                            Type = NotificationType.System,  
                            Status = NotificationStatus.Pending,
                            CreatedAt = DateTime.UtcNow,
                            PinId = pin.Id
                        };

                        _db.Notifications.Add(notification);
                    }
                }

                await _db.SaveChangesAsync();

                var likesCount = await _db.Likes.CountAsync(l => l.PinId.ToString() == pinId);

                return Ok(new
                {
                    likesCount,
                    isLiked
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error toggling pin like: {ex.Message}");
            }
        }

        /// <summary>
        /// Повертає список посилань на картинки зі сторінки за заданим URL з покращеними перевірками безпеки.
        /// </summary>
        /// <param name="websiteUrl">Посилання на вебсайт.</param>
        /// <returns>Список URL зображень з метаданими.</returns>
        [HttpGet("extract-images")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetImagesFromWebsite([FromQuery] string websiteUrl)
        {
            if (string.IsNullOrWhiteSpace(websiteUrl))
                return BadRequest("URL is required");

            if (!IsValidUrl(websiteUrl, out string normalizedUrl, out string errorMessage))
                return BadRequest(errorMessage);

            if (IsBlockedDomain(normalizedUrl))
                return BadRequest("Access to this domain is not allowed");

            using var httpClient = CreateSecureHttpClient();

            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

                var response = await httpClient.GetAsync(normalizedUrl, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest($"Failed to load website. Status code: {response.StatusCode}");
                }

                var contentType = response.Content.Headers.ContentType?.MediaType?.ToLower();
                if (contentType != null && !contentType.StartsWith("text/html") && !contentType.StartsWith("application/xhtml"))
                {
                    return BadRequest("URL does not point to an HTML page");
                }

                var contentLength = response.Content.Headers.ContentLength;
                const long maxContentSize = 5 * 1024 * 1024;
                if (contentLength > maxContentSize)
                {
                    return BadRequest("Content too large to process");
                }

                var html = await response.Content.ReadAsStringAsync(cts.Token);

                if (html.Length > maxContentSize)
                {
                    return BadRequest("HTML content too large to process");
                }

                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var websiteUri = new Uri(normalizedUrl);
                var images = ExtractImages(doc, websiteUri, normalizedUrl);

                const int maxImages = 30;
                if (images.Count > maxImages)
                {
                    images = images.Take(maxImages).ToList();
                }

                var metadata = ExtractPageMetadata(doc);

                return Ok(new
                {
                    Url = normalizedUrl,
                    TotalImages = images.Count,
                    Images = images,
                    PageMetadata = metadata
                });
            }
            catch (OperationCanceledException)
            {
                return BadRequest("Request timeout. The website took too long to respond.");
            }
            catch (HttpRequestException ex)
            {
                return BadRequest($"Failed to load website. Check URL or network connection: {ex.Message}");
            }
            catch (ArgumentException ex)
            {
                return BadRequest($"Invalid URL format: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting images from {normalizedUrl}: {ex}");
                return BadRequest("An error occurred while processing the website");
            }
        }

        /// <summary>
        /// Валідує та нормалізує URL.
        /// </summary>
        private bool IsValidUrl(string url, out string normalizedUrl, out string errorMessage)
        {
            normalizedUrl = string.Empty;
            errorMessage = string.Empty;

            try
            {
                url = url.Trim();

                if (!url.StartsWith("http://") && !url.StartsWith("https://"))
                {
                    url = "https://" + url;
                }
                if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
                {
                    errorMessage = "Invalid URL format";
                    return false;
                }

                if (uri.Scheme != "http" && uri.Scheme != "https")
                {
                    errorMessage = "Only HTTP and HTTPS URLs are allowed";
                    return false;
                }

                if (IsLocalAddress(uri.Host))
                {
                    errorMessage = "Access to local addresses is not allowed";
                    return false;
                }

                normalizedUrl = uri.ToString();
                return true;
            }
            catch (Exception ex)
            {
                errorMessage = $"URL validation error: {ex.Message}";
                return false;
            }
        }

        /// <summary>
        /// Перевіряє чи є домен заблокованим.
        /// </summary>
        private bool IsBlockedDomain(string url)
        {
            try
            {
                var uri = new Uri(url);
                var host = uri.Host.ToLower();
                var blockedDomains = new[]
                {
            "localhost",
            "127.0.0.1",
            "::1"
        };

                return blockedDomains.Contains(host);
            }
            catch
            {
                return true;
            }
        }

        /// <summary>
        /// Перевіряє чи є адреса локальною.
        /// </summary>
        private bool IsLocalAddress(string host)
        {
            if (string.IsNullOrEmpty(host))
                return true;

            host = host.ToLower();

            if (host == "localhost" || host == "127.0.0.1" || host == "::1")
                return true;

            if (host.StartsWith("192.168.") ||
                host.StartsWith("10.") ||
                host.StartsWith("172."))
                return true;
            if (host.StartsWith("169.254."))
                return true;

            return false;
        }

        /// <summary>
        /// Створює безпечний HTTP клієнт з обмеженнями.
        /// </summary>
        private HttpClient CreateSecureHttpClient()
        {
            var handler = new HttpClientHandler()
            {
                AllowAutoRedirect = true,
                MaxAutomaticRedirections = 5
            };

            var client = new HttpClient(handler);

            client.DefaultRequestHeaders.Add("User-Agent",
                "PinterestClone-Bot/1.0 (Image Extractor; +https://yoursite.com/about)");
            client.DefaultRequestHeaders.Add("Accept",
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.5");
            client.DefaultRequestHeaders.Add("DNT", "1");

            client.Timeout = TimeSpan.FromSeconds(30);

            return client;
        }

        /// <summary>
        /// Витягує зображення з HTML документу.
        /// </summary>
        private List<ExtractedImageDto> ExtractImages(HtmlDocument doc, Uri websiteUri, string websiteUrl)
        {
            var imgNodes = doc.DocumentNode.SelectNodes("//img[@src]") ?? new HtmlNodeCollection(null);
            var images = new List<ExtractedImageDto>();

            foreach (var node in imgNodes)
            {
                try
                {
                    var src = node.GetAttributeValue("src", "");
                    if (string.IsNullOrWhiteSpace(src))
                        continue;

                    if (!Uri.TryCreate(src, UriKind.Absolute, out var absoluteUri))
                    {
                        if (!Uri.TryCreate(websiteUri, src, out absoluteUri))
                            continue;
                    }

                    if (!IsValidImageUrl(absoluteUri.ToString()))
                        continue;

                    var width = ParseIntAttribute(node, "width");
                    var height = ParseIntAttribute(node, "height");
                    var alt = node.GetAttributeValue("alt", "")?.Trim() ?? "";
                    var title = node.GetAttributeValue("title", "")?.Trim() ?? "";
                    var loading = node.GetAttributeValue("loading", "")?.Trim() ?? "";

                    if ((width.HasValue && width < 50) || (height.HasValue && height < 50))
                        continue;

                    var imageDto = new ExtractedImageDto
                    {
                        Id = Guid.NewGuid().ToString(),
                        Url = absoluteUri.ToString(),
                        Alt = alt,
                        Title = title,
                        Width = width,
                        Height = height,
                        Loading = loading
                    };

                    images.Add(imageDto);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing image node: {ex.Message}");
                    continue;
                }
            }
            return images
                .GroupBy(img => img.Url)
                .Select(g => g.First())
                .OrderByDescending(img => (img.Width ?? 0) * (img.Height ?? 0)) // Сортуємо за розміром
                .ToList();
        }

        /// <summary>
        /// Перевіряє чи є URL зображення валідним.
        /// </summary>
        private bool IsValidImageUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            var lowerUrl = url.ToLower();

            // Фільтруємо небажані типи
            var excludePatterns = new[]
            {
        "logo", "icon", "favicon", "sprite", "thumb", "avatar",
        "social", "sharing", "button", "banner", "ad", "ads"
    };

            if (excludePatterns.Any(pattern => lowerUrl.Contains(pattern)))
                return false;

            // Фільтруємо за розширенням
            var invalidExtensions = new[] { ".svg", ".gif", ".ico" };
            if (invalidExtensions.Any(ext => lowerUrl.EndsWith(ext)))
                return false;

            // Перевіряємо на data URLs
            if (lowerUrl.StartsWith("data:"))
                return false;

            return true;
        }

        /// <summary>
        /// Парсить цілочисельний атрибут з HTML вузла.
        /// </summary>
        private int? ParseIntAttribute(HtmlNode node, string attributeName)
        {
            var value = node.GetAttributeValue(attributeName, null);
            if (string.IsNullOrEmpty(value))
                return null;

            // Видаляємо одиниці виміру (px, em, etc.)
            value = System.Text.RegularExpressions.Regex.Replace(value, @"[^\d]", "");

            return int.TryParse(value, out var result) && result > 0 ? result : null;
        }

        /// <summary>
        /// Витягує метадані сторінки.
        /// </summary>
        private object ExtractPageMetadata(HtmlDocument doc)
        {
            try
            {
                var title = doc.DocumentNode
                    .SelectSingleNode("//title")?.InnerText?.Trim() ?? "";

                var description = doc.DocumentNode
                    .SelectSingleNode("//meta[@name='description']")
                    ?.GetAttributeValue("content", "")?.Trim() ?? "";

                var ogTitle = doc.DocumentNode
                    .SelectSingleNode("//meta[@property='og:title']")
                    ?.GetAttributeValue("content", "")?.Trim() ?? "";

                var ogDescription = doc.DocumentNode
                    .SelectSingleNode("//meta[@property='og:description']")
                    ?.GetAttributeValue("content", "")?.Trim() ?? "";

                return new
                {
                    Title = !string.IsNullOrEmpty(ogTitle) ? ogTitle : title,
                    Description = !string.IsNullOrEmpty(ogDescription) ? ogDescription : description,
                    OriginalTitle = title,
                    OriginalDescription = description
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting metadata: {ex.Message}");
                return new { Title = "", Description = "" };
            }
        }

        [HttpGet("proxy-image")]
        public async Task<IActionResult> ProxyImage([FromQuery] string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("URL is required");

            using var httpClient = new HttpClient();
            try
            {
                var bytes = await httpClient.GetByteArrayAsync(url);
                var contentType = "image/jpeg";
                return File(bytes, contentType);
            }
            catch
            {
                return BadRequest("Failed to fetch image");
            }
        }

    }
} 