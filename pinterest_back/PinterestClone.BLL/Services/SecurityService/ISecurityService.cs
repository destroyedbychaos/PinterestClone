using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;

namespace PinterestClone.BLL.Services.SecurityService
{
    public interface ISecurityService
    {

        Task<ServiceResponse> GetSecuritySettingsAsync(string userId);
        Task<ServiceResponse> UpdateSecuritySettingsAsync(string userId, SecuritySettingsDto dto);

        Task<ServiceResponse> GetUserSessionsAsync(string userId);
        Task<ServiceResponse> RevokeSessionAsync(string userId, int sessionId);
        Task<ServiceResponse> RevokeAllOtherSessionsAsync(string userId, string currentSessionId);
        Task<ServiceResponse> CreateSessionAsync(string userId, string sessionId, string deviceInfo, string ipAddress);
        Task UpdateSessionActivityAsync(string sessionId);

        Task<ServiceResponse> GetConnectedAppsAsync(string userId);
        Task<ServiceResponse> RevokeAppAccessAsync(string userId, int appId);
    }
}
