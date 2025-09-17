using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;

namespace PinterestClone.BLL.Services.NotificationSettingsService
{
    public interface INotificationSettingsService
    {
        Task<ServiceResponse> GetNotificationSettingsAsync(string userId);
        Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, NotificationSettingsDto dto);
    }
}
