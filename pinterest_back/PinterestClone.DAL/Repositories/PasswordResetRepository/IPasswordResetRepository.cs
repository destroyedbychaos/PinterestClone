using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PasswordResetRepository
{
    public interface IPasswordResetRepository
    {
        Task<PasswordResetCode> CreateResetCodeAsync(string email, string code, DateTime expiresAt);
        Task<PasswordResetCode?> GetValidResetCodeAsync(string email, string code);
        Task MarkCodeAsUsedAsync(int codeId);
        Task DeleteExpiredCodesAsync();
        Task<bool> HasActiveResetCodeAsync(string email);
        Task UpdateResetCodeAsync(PasswordResetCode resetCode);
    }
} 