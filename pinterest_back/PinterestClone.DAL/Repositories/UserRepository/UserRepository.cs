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
                return await _userManager.Users
                .FirstOrDefaultAsync(predicate);
            }
            else
            {
                return await _userManager.Users
                .FirstOrDefaultAsync(predicate);
            }
        }

        public async Task<User?> GetByWalletAddressAsync(string walletAddress)
        {
            return await _userManager.Users
                .FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
        }

        public async Task<User?> CreateAsync(User user)
        {
            var result = await _userManager.CreateAsync(user);
            return result.Succeeded ? user : null;
        }

        public async Task<User?> UpdateAsync(User user)
        {
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded ? user : null;
        }
    }
}
