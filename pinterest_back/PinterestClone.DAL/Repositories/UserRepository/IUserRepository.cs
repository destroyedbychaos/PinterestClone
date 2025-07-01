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

    }
}
