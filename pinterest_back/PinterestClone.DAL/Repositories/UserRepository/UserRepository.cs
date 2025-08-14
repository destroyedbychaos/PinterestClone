using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.DAL.Repositories.UserRepository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        public UserRepository(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<bool> IsUniqueEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email) == null;
        }

        public async Task<IdentityResult> CreateAsync(User user, string password)
        {
            return await _userManager.CreateAsync(user, password);
        }

        public async Task<bool> CheckPasswordAsync(User user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<bool> IsUniqueUserNameAsync(string userName)
        {
            return await _userManager.FindByNameAsync(userName) == null;
        }

        public async Task<User?> GetByIdAsync(string id, bool includes = false)
        {
            return await GetUserAsync(id, includes);
        }
        public async Task<User?> GetUserAsync(
            string userId,
            bool includeActivity = false,
            bool includeFollowing = false,
            bool includeFollowers = false)
        {
            var query = _context.Users.AsQueryable();

            if (includeActivity)
            {
                query = query
                    .Include(u => u.Boards)
                    .Include(u => u.Pins)
                    .Include(u => u.Comments)
                    .Include(u => u.Likes);
            }

            var user = await query.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            if (includeFollowing)
                await _context.Entry(user).Collection(u => u.FollowingRelations).LoadAsync();

            if (includeFollowers)
                await _context.Entry(user).Collection(u => u.FollowerRelations).LoadAsync();

            return user;
        }

        public async Task<bool> FollowUserAsync(string followerId, string targetId)
        {
            if (followerId == targetId) return false;

            var exists = await _context.UserFollows.AnyAsync(uf => uf.FollowerId == followerId && uf.FollowingId == targetId);
            
            if (exists) return false;

            _context.UserFollows.Add(new UserFollow
            {
                FollowerId = followerId,
                FollowingId = targetId
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UnfollowUserAsync(string followerId, string targetId)
        {
            var relation = await _context.UserFollows.FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowingId == targetId);
            
            if (relation == null) return false;

            _context.UserFollows.Remove(relation);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<User>> GetFollowersAsync(string userId)
        {
            return await _context.UserFollows
                .Where(uf => uf.FollowingId == userId)
                .Select(uf => uf.Follower)
                .ToListAsync();
        }

        public async Task<List<User>> GetFollowingAsync(string userId)
        {
            return await _context.UserFollows
                .Where(uf => uf.FollowerId == userId)
                .Select(uf => uf.Following)
                .ToListAsync();
        }
    }
}
