using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.HiddenPinRepository
{
    public class HiddenPinRepository : IHiddenPinRepository
    {
        private readonly AppDbContext _context;

        public HiddenPinRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<HiddenPin?> GetByPinAndUserAsync(Guid pinId, string userId)
        {
            return await _context.HiddenPins
                .FirstOrDefaultAsync(hp => hp.PinId == pinId && hp.UserId == userId);
        }

        public async Task<HiddenPin> CreateAsync(HiddenPin hiddenPin)
        {
            _context.HiddenPins.Add(hiddenPin);
            await _context.SaveChangesAsync();
            return hiddenPin;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var hiddenPin = await _context.HiddenPins.FindAsync(id);
            if (hiddenPin == null)
                return false;

            _context.HiddenPins.Remove(hiddenPin);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IEnumerable<Guid>> GetHiddenPinIdsForUserAsync(string userId)
        {
            return await _context.HiddenPins
                .Where(hp => hp.UserId == userId)
                .Select(hp => hp.PinId)
                .ToListAsync();
        }
    }
} 