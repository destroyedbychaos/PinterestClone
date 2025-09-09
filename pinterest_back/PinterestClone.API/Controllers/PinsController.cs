using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.BLL.Services.ImageService;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

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
    }
} 