using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.SecurityRepository
{
    public interface ISecurityRepository
    {

        Task<SecuritySettings?> GetSecuritySettingsByUserIdAsync(string userId);
        Task<SecuritySettings> CreateSecuritySettingsAsync(SecuritySettings securitySettings);
        Task<SecuritySettings> UpdateSecuritySettingsAsync(SecuritySettings securitySettings);

        Task<List<UserSession>> GetUserSessionsAsync(string userId);
        Task<UserSession?> GetSessionByIdAsync(int sessionId);
        Task<UserSession> CreateSessionAsync(UserSession session);
        Task<UserSession> UpdateSessionAsync(UserSession session);
        Task<bool> RevokeSessionAsync(int sessionId);
        Task<bool> RevokeAllSessionsExceptCurrentAsync(string userId, string currentSessionId);
        Task<UserSession?> GetCurrentSessionAsync(string userId, string sessionId);
        Task UpdateLastActivityAsync(string sessionId);
    }
}
