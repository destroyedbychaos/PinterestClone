using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.PinRepository;

namespace PinterestClone.BLL.Services.PinService
{
    public class PinService : IPinService
    {
        private readonly IPinRepository _pinRepository;

        public PinService(IPinRepository pinRepository)
        {
            _pinRepository = pinRepository;
        }

        public async Task<PinResponseDto?> CreatePinAsync(CreatePinDto createPinDto, string userId)
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
            var pin = new Pin
            {
                Id = Guid.NewGuid(),
                Title = createPinDto.Title,
                Description = createPinDto.Description,
                ImageUrl = createPinDto.ImageUrl,
                Link = createPinDto.Link,
                Tags = normalizedTags,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var result = await _pinRepository.CreatePinAsync(pin, userId);
            if (result == null)
                return null;

            return new PinResponseDto
            {
                Id = result.Id.ToString(),
                Title = result.Title,
                Description = result.Description,
                ImageUrl = result.ImageUrl!,
                Link = result.Link,
                Tags = result.Tags,
                CreatedAt = result.CreatedAt,
                UserId = result.UserId,
                UserName = result.User?.UserName ?? "",
                Boards = result.BoardPins.Select(bp => new BoardSimpleDto
                {
                    Id = bp.Board!.Id.ToString(),
                    Name = bp.Board.Name
                }).ToList(),
                LikesCount = result.Likes.Count,
                CommentsCount = result.Comments.Count
            };
        }

        public async Task<PinResponseDto?> GetPinByIdAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);
            if (pin == null) return null;

            return new PinResponseDto
            {
                Id = pin.Id.ToString(),
                Title = pin.Title,
                Description = pin.Description,
                ImageUrl = pin.ImageUrl!,
                Link = pin.Link,
                Tags = pin.Tags,
                CreatedAt = pin.CreatedAt,
                UserId = pin.UserId,
                UserName = pin.User?.UserName ?? "",
                Boards = pin.BoardPins.Select(bp => new BoardSimpleDto
                {
                    Id = bp.Board!.Id.ToString(),
                    Name = bp.Board.Name
                }).ToList(),
                LikesCount = pin.Likes.Count,
                CommentsCount = pin.Comments.Count
            };
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

                query = query.Where(p =>
                    p.Tags != null &&
                    tagList.Any(tag =>
                        p.Tags.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim())
                        .Contains(tag)));
            }

            query = ApplySorting(query, sortBy, isAscending);

            int totalCount = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var pinDtos = pins.Select(p => new PinSimpleDto
            {
                Id = p.Id.ToString(),
                Title = p.Title,
                ImageUrl = p.ImageUrl!,
                Tags = p.Tags,
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count
            }).ToList();

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
                .Select(p => new PinSimpleDto
                {
                    Id = p.Id.ToString(),
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl!,
                    Tags = p.Tags,
                    CreatedAt = p.CreatedAt,
                    UserName = p.User!.UserName ?? "",
                    LikesCount = p.Likes.Count
                })
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
                .Select(p => new PinSimpleDto
                {
                    Id = p.Id.ToString(),
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl!,
                    Tags = p.Tags,
                    CreatedAt = p.CreatedAt,
                    UserName = p.User!.UserName ?? "",
                    LikesCount = p.Likes.Count,
                    CommentsCount = p.Comments.Count
                })
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

            pin.Title = updatePinDto.Title;
            pin.Description = updatePinDto.Description;
            pin.Link = updatePinDto.Link;
            if (!string.IsNullOrWhiteSpace(updatePinDto.Tags))
            {
                pin.Tags = string.Join(",",
                    updatePinDto.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(t => t.Trim().ToLower())
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                );
            }
            else
            {
                pin.Tags = null;
            }

            await _pinRepository.UpdatePinAsync(pinId, pin, userId);
            return await GetPinByIdAsync(pinId);
        }

        public async Task<bool> DeletePinAsync(string pinId, string userId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);
            if (pin == null || pin.UserId != userId)
                return false;

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

        private async Task<PinResponseDto?> GetPinResponseAsync(string pinId)
        {
            var pin = await _pinRepository.GetPinByIdAsync(pinId);

            if (pin == null)
                return null;

            return new PinResponseDto
            {
                Id = pin.Id.ToString(),
                Title = pin.Title,
                Description = pin.Description,
                ImageUrl = pin.ImageUrl!,
                Link = pin.Link,
                Tags = pin.Tags,
                CreatedAt = pin.CreatedAt,
                UserId = pin.UserId,
                UserName = pin.User!.UserName ?? "",
                Boards = pin.BoardPins.Select(bp => new BoardSimpleDto
                {
                    Id = bp.Board!.Id.ToString(),
                    Name = bp.Board.Name
                }).ToList(),
                LikesCount = pin.Likes.Count,
                CommentsCount = pin.Comments.Count
            };
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
                var tags = tagsStr.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .Where(t => !string.IsNullOrWhiteSpace(t));
                foreach (var tag in tags)
                    tagSet.Add(tag);
            }
            return tagSet.OrderBy(t => t).ToList();
        }
        public async Task<List<PinRecommendationDto>> GetRecommendedPinsAsync()
        {
            var pins = await _pinRepository.GetRecommendedPinsAsync(8);

            return pins.Select(p => new PinRecommendationDto
            {
                Id = p.Id.ToString(),
                Title = p.Title,
                ImageUrl = p.ImageUrl ?? ""
            }).ToList();
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