using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Services.AccountService
{
    public interface IAuthService
    {
        Task<ServiceResponse> LoginAsync(LoginVM model);
        Task<ServiceResponse> RegisterAsync(RegisterVM model);
    }
}
