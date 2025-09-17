using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.SocialPermissionsRepository
{
    public interface ISocialPermissionsRepository
    {
        Task<SocialPermissions?> GetByUserIdAsync(string userId);
        Task<SocialPermissions> CreateAsync(SocialPermissions socialPermissions);
        Task<SocialPermissions> UpdateAsync(SocialPermissions socialPermissions);
        Task<bool> DeleteAsync(int id);
        
        // Blocked users methods
        Task<IEnumerable<BlockedUser>> GetBlockedUsersAsync(string userId);
        Task<BlockedUser?> GetBlockedUserAsync(string blockerId, string blockedId);
        Task<BlockedUser> BlockUserAsync(string blockerId, string blockedId);
        Task<bool> UnblockUserAsync(string blockerId, string blockedId);
        
        // Keyword filters methods
        Task<IEnumerable<KeywordFilter>> GetKeywordFiltersAsync(string userId);
        Task AddKeywordFilterAsync(string userId, string keyword);
        Task RemoveKeywordFilterAsync(string userId, string keyword);
        Task ClearKeywordFiltersAsync(string userId);
    }
}
