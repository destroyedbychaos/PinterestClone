using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.SocialPermissionsRepository
{
    public class SocialPermissionsRepository : ISocialPermissionsRepository
    {
        private readonly AppDbContext _context;

        public SocialPermissionsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SocialPermissions?> GetByUserIdAsync(string userId)
        {
            return await _context.SocialPermissions
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<SocialPermissions> CreateAsync(SocialPermissions socialPermissions)
        {
            _context.SocialPermissions.Add(socialPermissions);
            await _context.SaveChangesAsync();
            return socialPermissions;
        }

        public async Task<SocialPermissions> UpdateAsync(SocialPermissions socialPermissions)
        {
            socialPermissions.UpdatedAt = DateTime.UtcNow;
            _context.SocialPermissions.Update(socialPermissions);
            await _context.SaveChangesAsync();
            return socialPermissions;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var socialPermissions = await _context.SocialPermissions.FindAsync(id);
            if (socialPermissions == null)
                return false;

            _context.SocialPermissions.Remove(socialPermissions);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IEnumerable<BlockedUser>> GetBlockedUsersAsync(string userId)
        {
            return await _context.BlockedUsers
                .Include(bu => bu.Blocked)
                .Where(bu => bu.BlockerId == userId)
                .OrderByDescending(bu => bu.CreatedAt)
                .ToListAsync();
        }

        public async Task<BlockedUser?> GetBlockedUserAsync(string blockerId, string blockedId)
        {
            return await _context.BlockedUsers
                .FirstOrDefaultAsync(bu => bu.BlockerId == blockerId && bu.BlockedId == blockedId);
        }

        public async Task<BlockedUser> BlockUserAsync(string blockerId, string blockedId)
        {
            var blockedUser = new BlockedUser
            {
                BlockerId = blockerId,
                BlockedId = blockedId
            };

            _context.BlockedUsers.Add(blockedUser);
            await _context.SaveChangesAsync();
            return blockedUser;
        }

        public async Task<bool> UnblockUserAsync(string blockerId, string blockedId)
        {
            var blockedUser = await GetBlockedUserAsync(blockerId, blockedId);
            if (blockedUser == null)
                return false;

            _context.BlockedUsers.Remove(blockedUser);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IEnumerable<KeywordFilter>> GetKeywordFiltersAsync(string userId)
        {
            return await _context.KeywordFilters
                .Where(kf => kf.UserId == userId)
                .OrderBy(kf => kf.Keyword)
                .ToListAsync();
        }

        public async Task AddKeywordFilterAsync(string userId, string keyword)
        {
            var existingFilter = await _context.KeywordFilters
                .FirstOrDefaultAsync(kf => kf.UserId == userId && kf.Keyword.ToLower() == keyword.ToLower());

            if (existingFilter == null)
            {
                var keywordFilter = new KeywordFilter
                {
                    UserId = userId,
                    Keyword = keyword.Trim()
                };

                _context.KeywordFilters.Add(keywordFilter);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveKeywordFilterAsync(string userId, string keyword)
        {
            var keywordFilter = await _context.KeywordFilters
                .FirstOrDefaultAsync(kf => kf.UserId == userId && kf.Keyword.ToLower() == keyword.ToLower());

            if (keywordFilter != null)
            {
                _context.KeywordFilters.Remove(keywordFilter);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearKeywordFiltersAsync(string userId)
        {
            var keywordFilters = await _context.KeywordFilters
                .Where(kf => kf.UserId == userId)
                .ToListAsync();

            _context.KeywordFilters.RemoveRange(keywordFilters);
            await _context.SaveChangesAsync();
        }
    }
}
