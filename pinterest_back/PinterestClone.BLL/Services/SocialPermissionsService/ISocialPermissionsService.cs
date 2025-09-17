using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;

namespace PinterestClone.BLL.Services.SocialPermissionsService
{
    public interface ISocialPermissionsService
    {
        Task<ServiceResponse> GetSocialPermissionsAsync(string userId);
        Task<ServiceResponse> UpdateSocialPermissionsAsync(string userId, SocialPermissionsDto dto);
        
        Task<ServiceResponse> GetBlockedUsersAsync(string userId);
        Task<ServiceResponse> BlockUserAsync(string blockerId, string blockedUserId);
        Task<ServiceResponse> UnblockUserAsync(string blockerId, string blockedUserId);
        
        Task<ServiceResponse> GetKeywordFiltersAsync(string userId);
        Task<ServiceResponse> UpdateKeywordFiltersAsync(string userId, KeywordFilterDto dto);
    }
}
