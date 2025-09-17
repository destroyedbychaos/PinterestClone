using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.NotificationSettingsRepository
{
    public class NotificationSettingsRepository : INotificationSettingsRepository
    {
        private readonly AppDbContext _context;

        public NotificationSettingsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationSettings?> GetByUserIdAsync(string userId)
        {
            return await _context.NotificationSettings
                .FirstOrDefaultAsync(ns => ns.UserId == userId);
        }

        public async Task<NotificationSettings> CreateAsync(NotificationSettings notificationSettings)
        {
            _context.NotificationSettings.Add(notificationSettings);
            await _context.SaveChangesAsync();
            return notificationSettings;
        }

        public async Task<NotificationSettings> UpdateAsync(NotificationSettings notificationSettings)
        {
            notificationSettings.UpdatedAt = DateTime.UtcNow;
            _context.NotificationSettings.Update(notificationSettings);
            await _context.SaveChangesAsync();
            return notificationSettings;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var notificationSettings = await _context.NotificationSettings.FindAsync(id);
            if (notificationSettings == null)
                return false;

            _context.NotificationSettings.Remove(notificationSettings);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
