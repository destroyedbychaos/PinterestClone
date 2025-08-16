using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.UserBlockRepository
{
    public interface IUserBlockRepository
    {
        Task<UserBlock?> GetByIdAsync(int id);
        Task<UserBlock?> GetByBlockerAndBlockedAsync(string blockerId, string blockedUserId);
        Task<IEnumerable<UserBlock>> GetBlockedUsersAsync(string blockerId);
        Task<IEnumerable<UserBlock>> GetBlockedByUsersAsync(string blockedUserId);
        Task<bool> IsBlockedAsync(string blockerId, string blockedUserId);
        Task<UserBlock> CreateAsync(UserBlock userBlock);
        Task<bool> DeleteAsync(int id);
        Task<bool> UnblockUserAsync(string blockerId, string blockedUserId);
    }
}
