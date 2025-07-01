using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Services.JwtService
{
    public interface IJwtService
    {
        Task<ServiceResponse> GenerateTokensAsync(User user);
        Task<ServiceResponse> RefreshTokensAsync(JwtVM model);
    }
}
