using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Services.PasswordResetService
{
    public interface IPasswordResetService
    {
        Task<ServiceResponse> ForgotPasswordAsync(ForgotPasswordVM model);
        Task<ServiceResponse> VerifyResetCodeAsync(VerifyResetCodeVM model);
        Task<ServiceResponse> ResetPasswordAsync(ResetPasswordVM model);
    }
} 