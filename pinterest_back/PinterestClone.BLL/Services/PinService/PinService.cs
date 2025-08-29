using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.PinRepository;
using Microsoft.AspNetCore.Http;
using PinterestClone.BLL.Services.ImageAnalysisService;
using PinterestClone.BLL.Services.ImageSearchService;
using AutoMapper;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.BLL.Services.FileBlobService;

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
                var uploadResult = await _fileService.UploadAsync(imageFile);
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

        public async Task<PinResponseDto?> GetPinByIdAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);
            if (pin == null) return null;

            return _mapper.Map<PinResponseDto>(pin);
        }

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

        public async Task<PinResponseDto?> UpdatePinAsync(string pinId, UpdatePinDto updatePinDto, string userId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);

            if (pin == null || pin.UserId != userId)
                return null;

            _mapper.Map(updatePinDto, pin);

            await _pinRepository.UpdatePinAsync(pinId, pin, userId);
            return await GetPinByIdAsync(pinId);
        }

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

        public async Task<bool> AddPinToBoardAsync(string pinId, string boardId, string userId)
        {
            await _pinRepository.AddPinToBoardAsync(new BoardPin
            {
                PinId = Guid.Parse(pinId),
                BoardId = Guid.Parse(boardId)
            });

            return true;
        }

        public async Task<bool> RemovePinFromBoardAsync(string pinId, string boardId, string userId)
        {
            await _pinRepository.RemovePinFromBoardAsync(pinId, boardId, userId);

            return true;
        }

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

        public async Task<PinResponseDto?> GetPinResponseAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);

            if (pin == null)
                return null;

            return _mapper.Map<PinResponseDto>(pin);
        }

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
        public async Task<List<PinRecommendationDto>> GetRecommendedPinsAsync()
        {
            var pins = await _pinRepository.GetRecommendedPinsAsync(8);
            return _mapper.Map<List<PinRecommendationDto>>(pins);
        }

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
                    var fileName = Path.GetFileName(imagePath);
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

    }
}

