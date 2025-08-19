namespace PinterestClone.BLL.Services.UserBlockService
{
    public interface IUserBlockService
    {
        Task<ServiceResponse> BlockUserAsync(string blockerId, string blockedUserId, string? reason = null);
        Task<ServiceResponse> UnblockUserAsync(string blockerId, string blockedUserId);
        Task<ServiceResponse> GetBlockedUsersAsync(string blockerId);
        Task<ServiceResponse> GetBlockedByUsersAsync(string blockedUserId);
        Task<ServiceResponse> IsBlockedAsync(string blockerId, string blockedUserId);
    }
}
