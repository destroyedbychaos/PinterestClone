using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinRepository
{
    public class PinRepository : IPinRepository
    {
        private readonly AppDbContext _context;

        public PinRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Pin?> CreatePinAsync(Pin pin, string userId)
        {
            pin.UserId = userId;
            await _context.Pins.AddAsync(pin);
            await _context.SaveChangesAsync();
            return pin;
        }

        public async Task<Pin?> GetPinByIdAsync(string pinId)
        {
            var guid = Guid.Parse(pinId);
            return await _context.Pins
                .Include(p => p.User)
                .Include(p => p.BoardPins).ThenInclude(bp => bp.Board)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == guid);
        }

        public IQueryable<Pin> GetAllPins()
        {
            return _context.Pins
                .Include(p => p.User)
                .Include(p => p.BoardPins).ThenInclude(bp => bp.Board)
                .Include(p => p.Likes)
                .Include(p => p.Comments);
        }

        public IQueryable<Pin> GetPinsByUserid(string userId, int pageNumber = 1)
        {
            return _context.Pins
                .Include(p => p.User)
                .Include(p => p.BoardPins).ThenInclude(bp => bp.Board)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .Where(p => p.UserId == userId);
        }

        public IQueryable<Pin> GetPinsByBoardId(string boardId, int pageNumber = 1)
        {
            var guid = Guid.Parse(boardId);
            return _context.Pins
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .Include(p => p.BoardPins).ThenInclude(bp => bp.Board)
                .Where(p => p.BoardPins.Any(bp => bp.BoardId == guid));
        }

        public async Task<Pin?> UpdatePinAsync(string pinId, Pin pin, string userId)
        {
            var guid = Guid.Parse(pinId);
            var existing = await _context.Pins.FirstOrDefaultAsync(p => p.Id == guid && p.UserId == userId);

            if (existing == null)
                return null;

            existing.Title = pin.Title;
            existing.Description = pin.Description;
            existing.ImageUrl = pin.ImageUrl;
            existing.Link = pin.Link;
            existing.Tags = pin.Tags;

            _context.Pins.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeletePinAsync(Pin pin)
        {
            _context.Pins.Remove(pin);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> IsPinOnBoardAsync(string pinId, string boardId)
        {
            return await _context.BoardPins.AnyAsync(bp => bp.PinId.ToString() == pinId && bp.BoardId.ToString() == boardId);
        }
        public async Task<bool> AddPinToBoardAsync(BoardPin boardPin) 
        {
            var existingBoardPin = await _context.BoardPins
                .FirstOrDefaultAsync(bp => bp.PinId == boardPin.PinId && bp.BoardId == boardPin.BoardId);

            if (existingBoardPin != null) 
            {
                return false;
            }

            await _context.BoardPins.AddAsync(boardPin);

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> RemovePinFromBoardAsync(string pinId, string boardId, string userId) 
        {
            var guidPinId = Guid.Parse(pinId);
            var guidBoardId = Guid.Parse(boardId);

            var boardPin = await _context.BoardPins
                .FirstOrDefaultAsync(bp => bp.PinId == guidPinId && bp.BoardId == guidBoardId);

            if (boardPin == null)
            {
                return false;
            }

            _context.BoardPins.Remove(boardPin);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<List<Pin>> GetRecommendedPinsAsync(int count)
        {
            return await _context.Pins
                .OrderByDescending(p => p.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<string>> GetTitleMatchesAsync(string query, int limit)
        {
            return await _context.Pins
                .Where(p => p.Title.ToLower().Contains(query))
                .Select(p => p.Title)
                .Distinct()
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<string>> GetTagMatchesAsync(string query, int limit)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<string>();

            query = query.ToLower();

            var allTagStrings = await _context.Pins
                .Where(p => !string.IsNullOrEmpty(p.Tags))
                .Select(p => p.Tags)
                .ToListAsync();

            var matchedTags = allTagStrings
                .SelectMany(tagsString => tagsString.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Select(t => t.Trim().ToLower())
                .Where(t => t.Contains(query))
                .Distinct()
                .Take(limit)
                .ToList();

            return matchedTags;
        }

    }
}
