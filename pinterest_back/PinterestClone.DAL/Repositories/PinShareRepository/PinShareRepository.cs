using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinShareRepository
{
    public class PinShareRepository : IPinShareRepository
    {
        private readonly AppDbContext _context;

        public PinShareRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PinShare?> GetByIdAsync(int id)
        {
            return await _context.PinShares
                .Include(ps => ps.Pin)
                .Include(ps => ps.SharedByUser)
                .Include(ps => ps.SharedWithUser)
                .FirstOrDefaultAsync(ps => ps.Id == id);
        }



        public async Task<PinShare> CreateAsync(PinShare pinShare)
        {
            _context.PinShares.Add(pinShare);
            await _context.SaveChangesAsync();
            return pinShare;
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var pinShare = await _context.PinShares.FindAsync(id);
            if (pinShare == null)
                return false;

            pinShare.IsRead = true;
            pinShare.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pinShare = await _context.PinShares.FindAsync(id);
            if (pinShare == null)
                return false;

            _context.PinShares.Remove(pinShare);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.PinShares
                .CountAsync(ps => ps.SharedWithUserId == userId && !ps.IsRead);
        }
    }
}