using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.HiddenPinService
{
    public interface IHiddenPinService
    {
        Task<ServiceResponse> HidePinAsync(string pinId, string userId);
        Task<ServiceResponse> UnhidePinAsync(string pinId, string userId);
        Task<ServiceResponse> GetHiddenPinIdsAsync(string userId);
    }
} 