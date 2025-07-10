using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.NotificationService
{
    public interface INotificationService
    {
        Task<ServiceResponse> CreateNotificationAsync(CreateNotificationDto createDto);
        Task<ServiceResponse> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 20);
        Task<ServiceResponse> SendPendingNotificationsAsync();
        Task<ServiceResponse> NotifyNewPinAsync(string userId, Guid pinId, string pinTitle);
        Task<ServiceResponse> NotifyPinUpdateAsync(string userId, Guid pinId, string pinTitle);
        Task<ServiceResponse> NotifyNewCommentAsync(string userId, Guid pinId, string commentText);
        Task<ServiceResponse> NotifyNewLikeAsync(string userId, Guid pinId);
        Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, NotificationSettingsDto settings);
        Task<ServiceResponse> MarkNotificationAsReadAsync(int notificationId, string userId);
        Task<ServiceResponse> GetUnreadNotificationsCountAsync(string userId);
    }
} 