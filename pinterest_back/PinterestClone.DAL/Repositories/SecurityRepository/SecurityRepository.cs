using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.SecurityRepository
{
    public class SecurityRepository : ISecurityRepository
    {
        private readonly AppDbContext _context;

        public SecurityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SecuritySettings?> GetSecuritySettingsByUserIdAsync(string userId)
        {
            return await _context.SecuritySettings
                .FirstOrDefaultAsync(ss => ss.UserId == userId);
        }

        public async Task<SecuritySettings> CreateSecuritySettingsAsync(SecuritySettings securitySettings)
        {
            _context.SecuritySettings.Add(securitySettings);
            await _context.SaveChangesAsync();
            return securitySettings;
        }

        public async Task<SecuritySettings> UpdateSecuritySettingsAsync(SecuritySettings securitySettings)
        {
            securitySettings.UpdatedAt = DateTime.UtcNow;
            _context.SecuritySettings.Update(securitySettings);
            await _context.SaveChangesAsync();
            return securitySettings;
        }

        public async Task<List<UserSession>> GetUserSessionsAsync(string userId)
        {
            return await _context.UserSessions
                .Where(us => us.UserId == userId && us.IsActive)
                .OrderByDescending(us => us.LastActivityAt)
                .ToListAsync();
        }

        public async Task<UserSession?> GetSessionByIdAsync(int sessionId)
        {
            return await _context.UserSessions.FindAsync(sessionId);
        }

        public async Task<UserSession> CreateSessionAsync(UserSession session)
        {
            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<UserSession> UpdateSessionAsync(UserSession session)
        {
            session.LastActivityAt = DateTime.UtcNow;
            _context.UserSessions.Update(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<bool> RevokeSessionAsync(int sessionId)
        {
            var session = await _context.UserSessions.FindAsync(sessionId);
            if (session == null)
                return false;

            session.IsActive = false;
            session.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeAllSessionsExceptCurrentAsync(string userId, string currentSessionId)
        {
            var sessions = await _context.UserSessions
                .Where(us => us.UserId == userId && us.SessionId != currentSessionId && us.IsActive)
                .ToListAsync();

            foreach (var session in sessions)
            {
                session.IsActive = false;
                session.RevokedAt = DateTime.UtcNow;
            }

            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<UserSession?> GetCurrentSessionAsync(string userId, string sessionId)
        {
            return await _context.UserSessions
                .FirstOrDefaultAsync(us => us.UserId == userId && us.SessionId == sessionId && us.IsActive);
        }

        public async Task UpdateLastActivityAsync(string sessionId)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(us => us.SessionId == sessionId && us.IsActive);

            if (session != null)
            {
                session.LastActivityAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
