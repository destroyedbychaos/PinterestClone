using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.NotificationSettingsRepository
{
    public interface INotificationSettingsRepository
    {
        Task<NotificationSettings?> GetByUserIdAsync(string userId);
        Task<NotificationSettings> CreateAsync(NotificationSettings notificationSettings);
        Task<NotificationSettings> UpdateAsync(NotificationSettings notificationSettings);
        Task<bool> DeleteAsync(int id);
    }
}
