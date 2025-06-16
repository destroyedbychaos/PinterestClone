using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Interfaces;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.BLL.Services
{
    public class PinService : IPinService
    {
        private readonly AppDbContext _context;

        public PinService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PinResponseDto> CreatePinAsync(CreatePinDto createPinDto, string userId)
        {
            var pin = new Pin
            {
                Title = createPinDto.Title,
                Description = createPinDto.Description,
                ImageUrl = createPinDto.ImageUrl,
                Link = createPinDto.Link,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Pins.Add(pin);
            await _context.SaveChangesAsync();

            var result = await GetPinResponseAsync(pin.Id);
            return result!; 
        }

        public async Task<PinResponseDto?> GetPinByIdAsync(Guid pinId)
        {
            return await GetPinResponseAsync(pinId);
        }

        public async Task<PinListDto> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null)
        {
            var query = _context.Pins
                .Include(p => p.User)
                .Include(p => p.Likes)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(p => p.Title.Contains(searchTerm) || 
                                        (p.Description != null && p.Description.Contains(searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(tags))
            {
                // Фільтрацію по тегах реалізую пізніше
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PinSimpleDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    // Tags = p.Tags, // 
                    CreatedAt = p.CreatedAt,
                    UserName = p.User.UserName ?? "",
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

        public async Task<PinListDto> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Pins
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Where(p => p.UserId == userId);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PinSimpleDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    // Tags = p.Tags, // 
                    CreatedAt = p.CreatedAt,
                    UserName = p.User.UserName ?? "",
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

        public async Task<PinListDto> GetBoardPinsAsync(Guid boardId, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.BoardPins
                .Include(bp => bp.Pin)
                    .ThenInclude(p => p.User)
                .Include(bp => bp.Pin)
                    .ThenInclude(p => p.Likes)
                .Where(bp => bp.BoardId == boardId);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pins = await query
                .OrderByDescending(bp => bp.Pin.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(bp => new PinSimpleDto
                {
                    Id = bp.Pin.Id,
                    Title = bp.Pin.Title,
                    Description = bp.Pin.Description,
                    ImageUrl = bp.Pin.ImageUrl,
                    // Tags = bp.Pin.Tags, // 
                    CreatedAt = bp.Pin.CreatedAt,
                    UserName = bp.Pin.User.UserName ?? "",
                    LikesCount = bp.Pin.Likes.Count
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

        public async Task<PinResponseDto?> UpdatePinAsync(Guid pinId, UpdatePinDto updatePinDto, string userId)
        {
            var pin = await _context.Pins
                .FirstOrDefaultAsync(p => p.Id == pinId && p.UserId == userId);

            if (pin == null)
                return null;

            pin.Title = updatePinDto.Title;
            pin.Description = updatePinDto.Description;
            pin.ImageUrl = updatePinDto.ImageUrl;
            pin.Link = updatePinDto.Link;
            // pin.Tags = updatePinDto.Tags; // 

            await _context.SaveChangesAsync();

            return await GetPinResponseAsync(pin.Id);
        }

        public async Task<bool> DeletePinAsync(Guid pinId, string userId)
        {
            var pin = await _context.Pins
                .FirstOrDefaultAsync(p => p.Id == pinId && p.UserId == userId);

            if (pin == null)
                return false;

            _context.Pins.Remove(pin);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AddPinToBoardAsync(Guid pinId, Guid boardId, string userId)
        {
            var pin = await _context.Pins.FirstOrDefaultAsync(p => p.Id == pinId);
            var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);

            if (pin == null || board == null)
                return false;

            var existingBoardPin = await _context.BoardPins
                .FirstOrDefaultAsync(bp => bp.BoardId == boardId && bp.PinId == pinId);

            if (existingBoardPin != null)
                return true; // Пін вже в дошці

            var boardPin = new BoardPin
            {
                BoardId = boardId,
                PinId = pinId
            };

            _context.BoardPins.Add(boardPin);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemovePinFromBoardAsync(Guid pinId, Guid boardId, string userId)
        {
            var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);
            if (board == null)
                return false;

            var boardPin = await _context.BoardPins
                .FirstOrDefaultAsync(bp => bp.BoardId == boardId && bp.PinId == pinId);

            if (boardPin == null)
                return false;

            _context.BoardPins.Remove(boardPin);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<PinResponseDto?> GetPinResponseAsync(Guid pinId)
        {
            var pin = await _context.Pins
                .Include(p => p.User)
                .Include(p => p.BoardPins)
                    .ThenInclude(bp => bp.Board)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == pinId);

            if (pin == null)
                return null;

            return new PinResponseDto
            {
                Id = pin.Id,
                Title = pin.Title,
                Description = pin.Description,
                ImageUrl = pin.ImageUrl,
                Link = pin.Link,
                // Tags = pin.Tags, // 
                CreatedAt = pin.CreatedAt,
                UserId = pin.UserId,
                UserName = pin.User.UserName ?? "",
                Boards = pin.BoardPins.Select(bp => new BoardSimpleDto
                {
                    Id = bp.Board.Id,
                    Name = bp.Board.Name
                }).ToList(),
                LikesCount = pin.Likes.Count,
                CommentsCount = pin.Comments.Count
            };
        }
    }
} 