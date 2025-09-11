using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Repositories.PinViewHistoryRepository
{
    public class PinViewHistoryRepository : IPinViewHistoryRepository
    {
        private readonly AppDbContext _context;

        public PinViewHistoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PinViewHistory> AddAsync(PinViewHistory pinViewHistory)
        {
            _context.PinViewHistories.Add(pinViewHistory);
            await _context.SaveChangesAsync();
            return pinViewHistory;
        }

        public void Update(PinViewHistory pinViewHistory)
        {
            _context.PinViewHistories.Update(pinViewHistory);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<List<PinViewHistory>> GetUserViewHistoryAsync(string userId, int page = 1, int pageSize = 50)
        {
            return await _context.PinViewHistories
                .Include(pvh => pvh.Pin)
                .Include(pvh => pvh.Pin.User)
                .Where(pvh => pvh.UserId == userId)
                .OrderByDescending(pvh => pvh.ViewedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<PinViewHistory>> GetUserViewHistoryByDateAsync(string userId, DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            return await _context.PinViewHistories
                .Include(pvh => pvh.Pin)
                .Include(pvh => pvh.Pin.User)
                .Where(pvh => pvh.UserId == userId && 
                             pvh.ViewedAt >= startDate && 
                             pvh.ViewedAt < endDate)
                .OrderByDescending(pvh => pvh.ViewedAt)
                .ToListAsync();
        }

        public async Task<List<PinViewHistory>> GetUserViewHistoryByDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
        {
            return await _context.PinViewHistories
                .Include(pvh => pvh.Pin)
                .Include(pvh => pvh.Pin.User)
                .Where(pvh => pvh.UserId == userId && 
                             pvh.ViewedAt >= startDate && 
                             pvh.ViewedAt <= endDate)
                .OrderByDescending(pvh => pvh.ViewedAt)
                .ToListAsync();
        }

        public async Task<int> GetUserViewHistoryCountAsync(string userId)
        {
            return await _context.PinViewHistories
                .CountAsync(pvh => pvh.UserId == userId);
        }

        public async Task<PinViewHistory?> GetLastViewAsync(string userId, Guid pinId)
        {
            return await _context.PinViewHistories
                .Where(pvh => pvh.UserId == userId && pvh.PinId == pinId)
                .OrderByDescending(pvh => pvh.ViewedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasUserViewedPinAsync(string userId, Guid pinId)
        {
            return await _context.PinViewHistories
                .AnyAsync(pvh => pvh.UserId == userId && pvh.PinId == pinId);
        }

        public async Task DeleteUserViewHistoryAsync(string userId)
        {
            var userHistory = await _context.PinViewHistories
                .Where(pvh => pvh.UserId == userId)
                .ToListAsync();

            _context.PinViewHistories.RemoveRange(userHistory);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteOldViewHistoryAsync(DateTime olderThan)
        {
            var oldHistory = await _context.PinViewHistories
                .Where(pvh => pvh.ViewedAt < olderThan)
                .ToListAsync();

            _context.PinViewHistories.RemoveRange(oldHistory);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveDuplicateViewsAsync(string userId)
        {
            
            var duplicates = await _context.PinViewHistories
                .Where(pvh => pvh.UserId == userId)
                .GroupBy(pvh => pvh.PinId)
                .Where(g => g.Count() > 1)
                .SelectMany(g => g.OrderBy(pvh => pvh.ViewedAt).Skip(1))
                .ToListAsync();

            if (duplicates.Any())
            {
                _context.PinViewHistories.RemoveRange(duplicates);
                await _context.SaveChangesAsync();
            }
        }
    }
}
