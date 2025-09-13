using AutoMapper;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Vml;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.FileBlobService;
using PinterestClone.BLL.Services.ImageAnalysisService;
using PinterestClone.BLL.Services.ImageSearchService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.PinRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.PinService
{
    public class PinService : IPinService
    {
        private readonly IPinRepository _pinRepository;
        private readonly IImageAnalysisService _imageAnalysisService;
        private readonly IImageSearchService _imageSearchService;
        private readonly IMapper _mapper;
        private readonly IFileService _fileService;
        private readonly IUserRepository _userRepository;

        public PinService(IPinRepository pinRepository, IImageAnalysisService imageAnalysisService, IImageSearchService imageSearchService, IMapper mapper, IUserRepository userRepository, IFileService fileService)
        {
            _pinRepository = pinRepository;
            _imageAnalysisService = imageAnalysisService;
            _imageSearchService = imageSearchService;
            _mapper = mapper;
            _userRepository = userRepository;
            _fileService = fileService;
        }

        /// <summary>
        /// Створює новий пін для користувача.
        /// </summary>
        /// <param name="createPinDto">Дані нового піна.</param>
        /// <param name="userId">ID користувача.</param>
        /// <param name="imageFile">Файл зображення для піна.</param>
        /// <returns><see cref="PinSimpleDto"> або <c>null</c>, якщо не вдалося.</returns>
        public async Task<PinResponseDto?> CreatePinAsync(CreatePinDto createPinDto, string userId, IFormFile? imageFile)
        {
            string? normalizedTags = null;
            if (!string.IsNullOrWhiteSpace(createPinDto.Tags))
            {
                normalizedTags = string.Join(",",
                    createPinDto.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim().ToLower())
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                );
            }
            
            var pin = _mapper.Map<Pin>(createPinDto);
            pin.UserId = userId;
            pin.User = await _userRepository.GetByIdAsync(userId);
            pin.Tags = normalizedTags;

            if (imageFile != null)
            {
                var uploadResult = await _fileService.UploadAsync(imageFile, pin.Id.ToString());
                if (!uploadResult.Error)
                {
                    pin.ImageUrl = uploadResult.Blob.Uri;
                }
            }

            var result = await _pinRepository.CreatePinAsync(pin, userId);
            if (result == null)
                return null;

            return _mapper.Map<PinResponseDto>(result);
        }

        /// <summary>
        /// Отримує пін за його ID.
        /// </summary>
        /// <param name="pinId">ID піна.</param>
        /// <returns><see cref="PinResponseDto"/> або <c>null</c>, якщо не знайдено.</returns>
        public async Task<PinResponseDto?> GetPinByIdAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);
            if (pin == null) return null;

            return _mapper.Map<PinResponseDto>(pin);
        }

        /// <summary>
        /// Отримує список пінів з пагінацією, сортуванням та фільтрацією за тегами чи пошуковим терміном.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінці (за замовчуванням 20).</param>
        /// <param name="searchTerm">Пошуковий термін.</param>
        /// <param name="tags">Список тегів для фільтрації через кому.</param>
        /// <param name="sortBy">Поле для сортування (по характеристикам createdAt, popularity, title, comments).</param>
        /// <param name="isAscending">Сортувати за зростанням, якщо <c>true</c>, або спаданням, якщо <c>false</c>.</param>
        /// <returns><see cref="PinListDto"/> або <c>null</c>.</returns>
        public async Task<PinListDto?> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null, string? sortBy = "createdAt", bool isAscending = false)
        {
            var query = _pinRepository.GetAllPins();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(p =>
                    (p.Title != null && p.Title.ToLower().Contains(term)) ||
                    (p.Description != null && p.Description.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(tags))
            {
                var tagList = tags.Split(',').Select(t => t.Trim().ToLower()).Where(t => !string.IsNullOrWhiteSpace(t)).ToList();

                query = query.Where(p => p.Tags != null && tagList.Any(tag => 
                    p.Tags.ToLower().Contains(tag)));
            }

            query = ApplySorting(query, sortBy, isAscending);

            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var pinDtos = _mapper.Map<List<PinSimpleDto>>(pins.ToList());

            return new PinListDto
            {
                Pins = pinDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує піни конкретного користувача за його ID.
        /// </summary>
        /// <param name="userId">ID користувача.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість пінів на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування.</param>
        /// <param name="isAscending">Сортувати за зростанням, якщо <c>true</c>, або спаданням, якщо <c>false</c>.</param>
        /// <returns><see cref="PinListDto"/> або <c>null</c>.</returns>
        public async Task<PinListDto?> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20, string? sortBy = "createdAt", bool isAscending = false)
        {
            var query = _pinRepository.GetPinsByUserid(userId);

            query = ApplySorting(query, sortBy, isAscending);

            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => _mapper.Map<PinSimpleDto>(p))
                .ToListAsync();

            return new PinListDto
            {
                Pins = pins,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує піни користувача за його username з підтримкою пагінації та сортування.
        /// </summary>
        /// <param name="username">Username користувача, чиї піни потрібно отримати.</param>
        /// <param name="pageNumber">Номер сторінки для пагінації (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість піни на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (наприклад, "createdAt", "popularity", "title", "comments").</param>
        /// <param name="isAscending"><c>True</c> для сортування за зростанням, <c>False</c> для сортування за спаданням.</param>
        /// <returns><see cref="PinListDto"/> або <c>null</c>, якщо користувача не знайдено або піни відсутні.</returns>
        public async Task<PinListDto?> GetUserPinsByUsernameAsync(string username, int pageNumber = 1, int pageSize = 20, string? sortBy = "createdAt", bool isAscending = false)
        {
            var query = _pinRepository.GetPinsByUsername(username);

            query = ApplySorting(query, sortBy, isAscending);

            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => _mapper.Map<PinSimpleDto>(p))
                .ToListAsync();

            return new PinListDto
            {
                Pins = pins,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує піни певної дошки за її ID з підтримкою пагінації та сортування.
        /// </summary>
        /// <param name="boardId">ID дошки, піни якої потрібно отримати.</param>
        /// <param name="pageNumber">Номер сторінки для пагінації (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість піни на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (наприклад, "createdAt", "popularity", "title", "comments").</param>
        /// <param name="isAscending"><c>True</c> для сортування за зростанням, <c>False</c> для сортування за спаданням.</param>
        /// <returns><see cref="PinListDto"/> з пінами дошки або <c>null</c>, якщо дошка порожня або не знайдена.</returns>
        public async Task<PinListDto?> GetBoardPinsAsync(string boardId, int pageNumber = 1, int pageSize = 20, string? sortBy = "createdAt", bool isAscending = false)
        {
            var query = _pinRepository.GetPinsByBoardId(boardId);

            query = ApplySorting(query, sortBy, isAscending);

            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => _mapper.Map<PinSimpleDto>(p))
                .ToListAsync();

            return new PinListDto
            {
                Pins = pins,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Оновлює інформацію про пін користувача.
        /// </summary>
        /// <param name="pinId">ID піна, який потрібно оновити.</param>
        /// <param name="updatePinDto">Дані для оновлення піна.</param>
        /// <param name="userId">ID користувача, який виконує оновлення.</param>
        /// <returns><see cref="PinResponseDto"/> з оновленим піном або <c>null</c>, якщо пін не знайдено або користувач не є власником.</returns>
        public async Task<PinResponseDto?> UpdatePinAsync(string pinId, UpdatePinDto updatePinDto, string userId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);

            if (pin == null || pin.UserId != userId)
                return null;

            _mapper.Map(updatePinDto, pin);

            await _pinRepository.UpdatePinAsync(pinId, pin, userId);
            return await GetPinByIdAsync(pinId);
        }

        /// <summary>
        /// Видаляє пін користувача разом із його зображенням, якщо воно є.
        /// </summary>
        /// <param name="pinId">ID піна, який потрібно видалити.</param>
        /// <param name="userId">ID користувача, який виконує видалення.</param>
        /// <returns><c>True</c>, якщо пін успішно видалено; <c>False</c>, якщо пін не знайдено або користувач не є власником.</returns>
        public async Task<bool> DeletePinAsync(string pinId, string userId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);
            if (pin == null || pin.UserId != userId)
                return false;

            if (!string.IsNullOrWhiteSpace(pin.ImageUrl))
            {
                var blobName = new Uri(pin.ImageUrl).Segments.Last();
                await _fileService.DeleteAsync(blobName);
            }

            return await _pinRepository.DeletePinAsync(pin);
        }

        /// <summary>
        /// Додає пін до дошки користувача.
        /// </summary>
        /// <param name="pinId">ID піна.</param>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="userId">ID користувача, який додає пін.</param>
        /// <returns><c>True</c>, якщо пін успішно додано, <c>False</c> якщо піна, користувача, чи дошки не знайдено.</returns>
        public async Task<bool> AddPinToBoardAsync(string pinId, string boardId, string userId)
        {
            await _pinRepository.AddPinToBoardAsync(new BoardPin
            {
                PinId = Guid.Parse(pinId),
                BoardId = Guid.Parse(boardId)
            });

            return true;
        }

        /// <summary>
        /// Видаляє пін з дошки користувача.
        /// </summary>
        /// <param name="pinId">ID піна.</param>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="userId">ID користувача, який видаляє пін.</param>
        /// <returns><c>true</c>, якщо пін успішно видалено, <c>False</c> якщо дошку, пін, чи користувача не знайдено.</returns>
        public async Task<bool> RemovePinFromBoardAsync(string pinId, string boardId, string userId)
        {
            await _pinRepository.RemovePinFromBoardAsync(pinId, boardId, userId);

            return true;
        }

        /// <summary>
        /// Застосовує сортування до колекції піни за заданим критерієм.
        /// </summary>
        /// <param name="query">Колекція піни для сортування.</param>
        /// <param name="sortBy">Поле для сортування ("createdAt", "popularity", "title", "comments").</param>
        /// <param name="isAscending">Якщо <c>true</c>, сортування за зростанням; інакше за спаданням.</param>
        /// <returns>Відсортовану колекцію <see cref="IQueryable{Pin}"/>.</returns>
        private IQueryable<Pin> ApplySorting(IQueryable<Pin> query, string? sortBy, bool isAscending)
        {
            return sortBy?.ToLower() switch
            {
                "createdat" or "created" => isAscending
                    ? query.OrderBy(p => p.CreatedAt)
                    : query.OrderByDescending(p => p.CreatedAt),

                "popularity" or "likes" => isAscending
                    ? query.OrderBy(p => p.Likes.Count)
                    : query.OrderByDescending(p => p.Likes.Count),

                "title" or "name" => isAscending
                    ? query.OrderBy(p => p.Title)
                    : query.OrderByDescending(p => p.Title),

                "comments" => isAscending
                    ? query.OrderBy(p => p.Comments.Count)
                    : query.OrderByDescending(p => p.Comments.Count),

                _ => query.OrderByDescending(p => p.CreatedAt)
            };
        }

        /// <summary>
        /// Отримує детальну інформацію про пін за його ID.
        /// </summary>
        /// <param name="pinId">ID піна.</param>
        /// <returns><see cref="PinResponseDto"/> з даними піна або <c>null</c>, якщо пін не знайдено.</returns>
        public async Task<PinResponseDto?> GetPinResponseAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);

            if (pin == null)
                return null;

            return _mapper.Map<PinResponseDto>(pin);
        }

        /// <summary>
        /// Отримує список усіх унікальних тегів зі всіх пінів.
        /// </summary>
        /// <returns>Список тегів у відсортованому <see cref="List<string>"/>.</returns>
        public async Task<List<string>> GetAllTagsAsync()
        {
            var allTags = await _pinRepository.GetAllPins()
                .Where(p => p.Tags != null && p.Tags != "")
                .Select(p => p.Tags)
                .ToListAsync();

            var tagSet = new HashSet<string>();
            foreach (var tagsStr in allTags)
            {
                if (!string.IsNullOrWhiteSpace(tagsStr))
                {
                    var tags = tagsStr.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim())
                        .Where(t => !string.IsNullOrWhiteSpace(t));
                    foreach (var tag in tags)
                        tagSet.Add(tag);
                }
            }
            return tagSet.OrderBy(t => t).ToList();
        }

        public async Task<List<PinRecommendationDto>> GetRecommendedPinsAsync(string userId, int count = 20)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.Interests))
            {
                var latestPins = await _pinRepository.GetLatestPinsAsync(count);
                return _mapper.Map<List<PinRecommendationDto>>(latestPins);
            }

            var interests = user.Interests
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(i => i.Trim().ToLower())
                .ToList();

            var allPins = await _pinRepository.GetAllPins()
                .Include(p => p.Likes)
                .Include(p => p.BoardPins)
                .ToListAsync();

            var scoredPins = allPins.Select(p =>
            {
                int score = 0;

                if (!string.IsNullOrEmpty(p.Tags))
                {
                    var tags = p.Tags.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var interest in interests)
                    {
                        if (tags.Contains(interest)) score += 3;
                        else if (tags.Any(t => t.Contains(interest))) score += 2;
                    }
                }

                score += p.Likes?.Count / 5 ?? 0;
                score += p.BoardPins?.Count / 3 ?? 0;

                if (p.CreatedAt >= DateTime.UtcNow.AddDays(-7))
                    score += 1;

                return new { Pin = p, Score = score };
            });

            var recommended = scoredPins
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.Pin.CreatedAt)
                .Take(count)
                .Select(x => x.Pin)
                .ToList();

            return _mapper.Map<List<PinRecommendationDto>>(recommended);
        }

        /// <summary>
        /// Шукає піни за текстовим запитом.
        /// </summary>
        /// <param name="searchTerm">Пошуковий термін.</param>
        /// <param name="searchInTitle">Шукати у заголовку.</param>
        /// <param name="searchInDescription">Шукати у описі.</param>
        /// <param name="exactMatch">Чи використовувати точне співпадіння.</param>
        /// <param name="pageNumber">Номер сторінки.</param>
        /// <param name="pageSize">Кількість підів на сторінку.</param>
        /// <returns><see cref="PinListDto"/> з результатами пошуку.</returns>
        public async Task<PinListDto?> SearchPinsAsync(string searchTerm, bool searchInTitle = true, bool searchInDescription = true, bool exactMatch = false, int pageNumber = 1, int pageSize = 20)
        {
            var query = _pinRepository.GetAllPins();
            var term = searchTerm.ToLower();

            if (exactMatch)
            {
                if (searchInTitle)
                    query = query.Where(p => p.Title.ToLower() == term);
                if (searchInDescription)
                    query = query.Where(p => p.Description != null && p.Description.ToLower() == term);
            }
            else
            {
                if (searchInTitle)
                    query = query.Where(p => p.Title.ToLower().Contains(term));
                if (searchInDescription)
                    query = query.Where(p => p.Description != null && p.Description.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync();
            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PinListDto
            {
                Pins = _mapper.Map<List<PinSimpleDto>>(pins),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        /// <summary>
        /// Шукає піни за хешем зображення, порівнюючи теги.
        /// </summary>
        /// <param name="imageHash">Хеш зображення.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість підів на сторінку(за замовчуванням 20).</param>
        /// <returns><see cref="PinListDto"/> з результатами.</returns>
        public async Task<PinListDto?> SearchPinsByImageAsync(string imageHash, int pageNumber = 1, int pageSize = 20)
        {
            try
            {

                var allPins = await _pinRepository.GetAllPins().ToListAsync();
                var similarPins = new List<(Pin pin, double similarity)>();

                foreach (var pin in allPins)
                {

                    if (!string.IsNullOrEmpty(pin.Tags))
                    {
                        var pinTags = pin.Tags.Split(',').Select(t => t.Trim().ToLower()).ToList();
                        

                        var similarity = pinTags.Count(t => imageHash.Contains(t)) / (double)Math.Max(pinTags.Count, 1);
                        
                        if (similarity > 0.1)
                        {
                            similarPins.Add((pin, similarity));
                        }
                    }
                }


                var sortedPins = similarPins
                    .OrderByDescending(x => x.similarity)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => x.pin)
                    .ToList();

                return new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(sortedPins),
                    TotalCount = similarPins.Count,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)similarPins.Count / pageSize)
                };
            }
            catch (Exception ex)
            {

                var query = _pinRepository.GetAllPins();
                var totalCount = await query.CountAsync();
                var pins = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(query),
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };
            }
        }

        /// <summary>
        /// Знаходить піни зі схожими зображеннями за допомогою сервісу пошуку зображень.
        /// </summary>
        /// <param name="imageFile">Файл зображення для пошуку.</param>
        /// <param name="searchArea">Область для пошуку.</param>
        /// <param name="selectionCoords">Координати вибору.</param>
        /// <returns><see cref="PinListDto"/> з результатами пошуку.</returns>
        public async Task<PinListDto?> FindSimilarImagesAsync(IFormFile imageFile, string? searchArea = null, string? selectionCoords = null)
        {
            try
            {
                Console.WriteLine($"PinService.FindSimilarImagesAsync called - SearchArea: {searchArea}, SelectionCoords: {selectionCoords}");
                
                var searchAreaInfo = new { SearchArea = searchArea, SelectionCoords = selectionCoords };
                
                Console.WriteLine("Calling _imageSearchService.FindSimilarImagesAsync...");

                var similarImagePaths = await _imageSearchService.FindSimilarImagesAsync(imageFile, searchAreaInfo);
                Console.WriteLine($"FindSimilarImagesAsync completed, found {similarImagePaths.Count} similar images");

                var allPins = await _pinRepository.GetAllPins().ToListAsync();
                var similarPins = new List<Pin>();

                foreach (var imagePath in similarImagePaths)
                {
                    var fileName = System.IO.Path.GetFileName(imagePath);
                    var matchingPins = allPins.Where(pin => pin.ImageUrl != null && 
                        (pin.ImageUrl.Contains(fileName) || pin.ImageUrl.EndsWith(fileName))).ToList();
                    similarPins.AddRange(matchingPins);
                }

                if (!similarPins.Any())
                {
                    similarPins = allPins.Take(30).ToList();
                }

                var result = new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(similarPins),
                    TotalCount = similarPins.Count,
                    PageNumber = 1,
                    PageSize = 30,
                    TotalPages = 1
                };
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка в FindSimilarImagesAsync: {ex.Message}");
                var query = _pinRepository.GetAllPins();
                var pins = await query.Take(30).ToListAsync();

                var fallbackResult = new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(pins),
                    TotalCount = pins.Count,
                    PageNumber = 1,
                    PageSize = 30,
                    TotalPages = 1
                };
                
                return fallbackResult;
            }
        }

        /// <summary>
        /// Отримує пропозиції пошукових запитів на основі введеного тексту.
        /// </summary>
        /// <param name="query">Пошуковий запит.</param>
        /// <returns>Список пропозицій <see cref="List<string>"/>.</returns>
        public async Task<List<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<string>();

            query = query.Trim().ToLower();

            var titleMatches = await _pinRepository.GetTitleMatchesAsync(query, 5);
            var tagMatches = await _pinRepository.GetTagMatchesAsync(query, 5);

            var combined = titleMatches
                .Concat(tagMatches)
                .Distinct()
                .Take(10)
                .ToList();

            return combined;
        }

        public async Task<PinListDto?> GetSimilarPinsByTagsAsync(string pinId, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var currentPin = await _pinRepository.GetPinByIdAsync(pinId);
                if (currentPin == null || string.IsNullOrEmpty(currentPin.Tags))
                {
                    return await GetRecommendedPinsAsync(pageNumber, pageSize);
                }

                var currentTags = currentPin.Tags.Split(',')
                    .Select(t => t.Trim().ToLower())
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .ToList();

                if (!currentTags.Any())
                {
                    return await GetRecommendedPinsAsync(pageNumber, pageSize);
                }

                var allPins = await _pinRepository.GetAllPins()
                    .Where(p => p.Id.ToString() != pinId)
                    .ToListAsync();

                var similarPins = new List<(Pin pin, double similarity)>();

                foreach (var pin in allPins)
                {
                    if (!string.IsNullOrEmpty(pin.Tags))
                    {
                        var pinTags = pin.Tags.Split(',')
                            .Select(t => t.Trim().ToLower())
                            .Where(t => !string.IsNullOrWhiteSpace(t))
                            .ToList();

                        if (pinTags.Any())
                        {
                            var commonTags = currentTags.Intersect(pinTags).Count();
                            var totalTags = Math.Max(currentTags.Count, pinTags.Count);
                            var similarity = commonTags / (double)totalTags;

                            if (similarity > 0.1) 
                            {
                                similarPins.Add((pin, similarity));
                            }
                        }
                    }
                }

                var sortedPins = similarPins
                    .OrderByDescending(x => x.similarity)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => x.pin)
                    .ToList();

                return new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(sortedPins),
                    TotalCount = similarPins.Count,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)similarPins.Count / pageSize)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка в GetSimilarPinsByTagsAsync: {ex.Message}");
                return await GetRecommendedPinsAsync(pageNumber, pageSize);
            }
        }

        public async Task<PinListDto?> GetSimilarPinsByImageAsync(string pinId, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var currentPin = await _pinRepository.GetPinByIdAsync(pinId);
                if (currentPin == null)
                {
                    return await GetRecommendedPinsAsync(pageNumber, pageSize);
                }


                return await GetSimilarPinsByTagsAsync(pinId, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка в GetSimilarPinsByImageAsync: {ex.Message}");
                return await GetRecommendedPinsAsync(pageNumber, pageSize);
            }
        }

        public async Task<PinListDto?> GetPinRecommendationsAsync(string pinId, int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var recommendedPins = await _pinRepository.GetRecommendedPinsAsync(pageSize);
                var filteredPins = recommendedPins
                    .Where(p => p.Id.ToString() != pinId)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(filteredPins),
                    TotalCount = recommendedPins.Count(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)recommendedPins.Count() / pageSize)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка в GetPinRecommendationsAsync: {ex.Message}");
                return new PinListDto
                {
                    Pins = new List<PinSimpleDto>(),
                    TotalCount = 0,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = 0
                };
            }
        }

        private async Task<PinListDto?> GetRecommendedPinsAsync(int pageNumber, int pageSize)
        {
            try
            {
                var recommendedPins = await _pinRepository.GetRecommendedPinsAsync(pageSize);
                var pagedPins = recommendedPins
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return new PinListDto
                {
                    Pins = _mapper.Map<List<PinSimpleDto>>(pagedPins),
                    TotalCount = recommendedPins.Count(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)recommendedPins.Count() / pageSize)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка в GetRecommendedPinsAsync: {ex.Message}");
                return new PinListDto
                {
                    Pins = new List<PinSimpleDto>(),
                    TotalCount = 0,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = 0
                };
            }
        }

    }
}

