using PinterestClone.DAL.Models.Identity;
using Microsoft.AspNetCore.Identity;
using System.Linq.Expressions;

namespace PinterestClone.DAL.Repositories.UserRepository
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsUniqueEmailAsync(string email);
        Task<IdentityResult> CreateAsync(User user, string password);
        Task<bool> CheckPasswordAsync(User user, string password);
        Task<bool> IsUniqueUserNameAsync(string userName);
        Task<User?> GetByIdAsync(string id, bool includeRoles = false);
        Task<User?> GetUserAsync(string userId, bool includes = false, bool loadFollowing = false, bool loadFollowers = false);
        Task<List<User?>> GetFollowersAsync(string id);
        Task<List<User?>> GetFollowingAsync(string id);
        Task<bool> FollowUserAsync(string followerId, string targetId);
        Task<bool> UnfollowUserAsync(string followerId, string targetId);
        Task<bool> IsFollowingAsync(string followerId, string targetId);
        Task<int> GetFollowersCountAsync(string userId);
        Task<int> GetFollowingCountAsync(string userId);
        Task<bool> IsBlockedAsync(string blockerId, string blockedUserId);
    }
}
