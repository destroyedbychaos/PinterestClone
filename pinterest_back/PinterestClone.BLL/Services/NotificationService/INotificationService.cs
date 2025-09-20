using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.NotificationService
{
    public interface INotificationService
    {
        Task<ServiceResponse> GetUserNotificationsAsync(string userId);
        Task<ServiceResponse> CreateLoginNotificationAsync(string userId);
        Task<ServiceResponse> MarkAllAsReadAsync(string userId);
        Task<ServiceResponse> CreatePinSharedNotificationAsync(string recipientUserId, Guid pinId, string senderUserName, string? message = null);
    }
} 