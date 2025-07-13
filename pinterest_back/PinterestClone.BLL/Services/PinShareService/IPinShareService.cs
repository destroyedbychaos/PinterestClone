using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.PinShareService
{
    public interface IPinShareService
    {
        Task<ServiceResponse> SharePinAsync(SharePinDto sharePinDto, string sharedByUserId);
        Task<ServiceResponse> GetPinShareByIdAsync(int id);
        Task<ServiceResponse> MarkAsReadAsync(int id, string userId);
        Task<ServiceResponse> DeletePinShareAsync(int id, string userId);
        Task<ServiceResponse> GetUnreadCountAsync(string userId);
    }
} 