using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.UserBlockRepository
{
    public class UserBlockRepository : IUserBlockRepository
    {
        private readonly AppDbContext _context;

        public UserBlockRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserBlock?> GetByIdAsync(int id)
        {
            return await _context.UserBlocks
                .Include(ub => ub.Blocker)
                .Include(ub => ub.BlockedUser)
                .FirstOrDefaultAsync(ub => ub.Id == id);
        }

        public async Task<UserBlock?> GetByBlockerAndBlockedAsync(string blockerId, string blockedUserId)
        {
            return await _context.UserBlocks
                .Include(ub => ub.Blocker)
                .Include(ub => ub.BlockedUser)
                .FirstOrDefaultAsync(ub => ub.BlockerId == blockerId && ub.BlockedUserId == blockedUserId);
        }

        public async Task<IEnumerable<UserBlock>> GetBlockedUsersAsync(string blockerId)
        {
            return await _context.UserBlocks
                .Include(ub => ub.BlockedUser)
                .Where(ub => ub.BlockerId == blockerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserBlock>> GetBlockedByUsersAsync(string blockedUserId)
        {
            return await _context.UserBlocks
                .Include(ub => ub.Blocker)
                .Where(ub => ub.BlockedUserId == blockedUserId)
                .ToListAsync();
        }

        public async Task<bool> IsBlockedAsync(string blockerId, string blockedUserId)
        {
            return await _context.UserBlocks
                .AnyAsync(ub => ub.BlockerId == blockerId && ub.BlockedUserId == blockedUserId);
        }

        public async Task<UserBlock> CreateAsync(UserBlock userBlock)
        {
            _context.UserBlocks.Add(userBlock);
            await _context.SaveChangesAsync();
            return userBlock;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var userBlock = await _context.UserBlocks.FindAsync(id);
            if (userBlock == null)
                return false;

            _context.UserBlocks.Remove(userBlock);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnblockUserAsync(string blockerId, string blockedUserId)
        {
            var userBlock = await _context.UserBlocks
                .FirstOrDefaultAsync(ub => ub.BlockerId == blockerId && ub.BlockedUserId == blockedUserId);
            
            if (userBlock == null)
                return false;

            _context.UserBlocks.Remove(userBlock);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
