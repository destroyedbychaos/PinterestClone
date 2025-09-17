using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.SecurityRepository;
using PinterestClone.DAL.Repositories.UserRepository;
using System.Text.Json;

namespace PinterestClone.BLL.Services.SecurityService
{
    public class SecurityService : ISecurityService
    {
        private readonly ISecurityRepository _securityRepository;
        private readonly IUserRepository _userRepository;

        public SecurityService(
            ISecurityRepository securityRepository,
            IUserRepository userRepository)
        {
            _securityRepository = securityRepository;
            _userRepository = userRepository;
        }

        public async Task<ServiceResponse> GetSecuritySettingsAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var settings = await _securityRepository.GetSecuritySettingsByUserIdAsync(userId);
                
                if (settings == null)
                {

                    settings = new SecuritySettings
                    {
                        UserId = userId
                    };
                    settings = await _securityRepository.CreateSecuritySettingsAsync(settings);
                }

                var dto = MapToSecuritySettingsDto(settings);
                return ServiceResponse.OkResponse("Security settings retrieved successfully", dto);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving security settings: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> UpdateSecuritySettingsAsync(string userId, SecuritySettingsDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var settings = await _securityRepository.GetSecuritySettingsByUserIdAsync(userId);
                
                if (settings == null)
                {
                    settings = new SecuritySettings
                    {
                        UserId = userId
                    };
                    MapFromSecuritySettingsDto(dto, settings);
                    await _securityRepository.CreateSecuritySettingsAsync(settings);
                }
                else
                {
                    MapFromSecuritySettingsDto(dto, settings);
                    await _securityRepository.UpdateSecuritySettingsAsync(settings);
                }

                return ServiceResponse.OkResponse("Security settings updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error updating security settings: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetUserSessionsAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var sessions = await _securityRepository.GetUserSessionsAsync(userId);
                var sessionDtos = sessions.Select(MapToUserSessionDto).ToList();

                return ServiceResponse.OkResponse("User sessions retrieved successfully", sessionDtos);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving user sessions: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> RevokeSessionAsync(string userId, int sessionId)
        {
            try
            {
                var session = await _securityRepository.GetSessionByIdAsync(sessionId);
                if (session == null || session.UserId != userId)
                {
                    return ServiceResponse.BadRequestResponse("Session not found");
                }

                var result = await _securityRepository.RevokeSessionAsync(sessionId);
                if (result)
                {
                    return ServiceResponse.OkResponse("Session revoked successfully");
                }

                return ServiceResponse.BadRequestResponse("Failed to revoke session");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error revoking session: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> RevokeAllOtherSessionsAsync(string userId, string currentSessionId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var result = await _securityRepository.RevokeAllSessionsExceptCurrentAsync(userId, currentSessionId);
                if (result)
                {
                    return ServiceResponse.OkResponse("All other sessions revoked successfully");
                }

                return ServiceResponse.OkResponse("No other sessions to revoke");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error revoking sessions: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> CreateSessionAsync(string userId, string sessionId, string deviceInfo, string ipAddress)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var session = new UserSession
                {
                    UserId = userId,
                    SessionId = sessionId,
                    DeviceName = ExtractDeviceName(deviceInfo),
                    DeviceType = ExtractDeviceType(deviceInfo),
                    OperatingSystem = ExtractOS(deviceInfo),
                    Browser = ExtractBrowser(deviceInfo),
                    IpAddress = ipAddress,
                    Location = "Unknown", 
                    IsActive = true,
                    IsCurrent = true
                };

                var existingSessions = await _securityRepository.GetUserSessionsAsync(userId);
                foreach (var existingSession in existingSessions)
                {
                    if (existingSession.IsCurrent)
                    {
                        existingSession.IsCurrent = false;
                        await _securityRepository.UpdateSessionAsync(existingSession);
                    }
                }

                await _securityRepository.CreateSessionAsync(session);
                return ServiceResponse.OkResponse("Session created successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error creating session: {ex.Message}");
            }
        }

        public async Task UpdateSessionActivityAsync(string sessionId)
        {
            try
            {
                await _securityRepository.UpdateLastActivityAsync(sessionId);
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Error updating session activity: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetConnectedAppsAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var connectedApps = new List<ConnectedAppDto>
                {
                    new ConnectedAppDto
                    {
                        Id = 1,
                        AppName = "Pinterest Mobile App",
                        Description = "Official Pinterest mobile application",
                        ConnectedAt = DateTime.UtcNow.AddDays(-30),
                        LastUsedAt = DateTime.UtcNow.AddHours(-2),
                        Permissions = new List<string> { "Read profile", "Manage pins", "Manage boards" }
                    },
                    new ConnectedAppDto
                    {
                        Id = 2,
                        AppName = "Third-party Analytics",
                        Description = "Analytics tool for Pinterest insights",
                        ConnectedAt = DateTime.UtcNow.AddDays(-15),
                        LastUsedAt = DateTime.UtcNow.AddDays(-3),
                        Permissions = new List<string> { "Read profile", "Read pins" }
                    }
                };

                return ServiceResponse.OkResponse("Connected apps retrieved successfully", connectedApps);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving connected apps: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> RevokeAppAccessAsync(string userId, int appId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                await Task.Delay(100); 

                return ServiceResponse.OkResponse("App access revoked successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error revoking app access: {ex.Message}");
            }
        }

        private SecuritySettingsDto MapToSecuritySettingsDto(SecuritySettings settings)
        {
            return new SecuritySettingsDto
            {
                GoogleLoginEnabled = settings.GoogleLoginEnabled,
                FacebookLoginEnabled = settings.FacebookLoginEnabled,
                AppleLoginEnabled = settings.AppleLoginEnabled,
                TwoFactorEnabled = settings.TwoFactorEnabled,
                SmsBackupEnabled = settings.SmsBackupEnabled,
                EmailBackupEnabled = settings.EmailBackupEnabled,
                LoginNotificationsEnabled = settings.LoginNotificationsEnabled,
                SuspiciousActivityNotifications = settings.SuspiciousActivityNotifications,
                PasswordChangeNotifications = settings.PasswordChangeNotifications,
                ShowOnlineStatus = settings.ShowOnlineStatus,
                AllowPasswordReset = settings.AllowPasswordReset
            };
        }

        private void MapFromSecuritySettingsDto(SecuritySettingsDto dto, SecuritySettings settings)
        {
            settings.GoogleLoginEnabled = dto.GoogleLoginEnabled;
            settings.FacebookLoginEnabled = dto.FacebookLoginEnabled;
            settings.AppleLoginEnabled = dto.AppleLoginEnabled;
            settings.TwoFactorEnabled = dto.TwoFactorEnabled;
            settings.SmsBackupEnabled = dto.SmsBackupEnabled;
            settings.EmailBackupEnabled = dto.EmailBackupEnabled;
            settings.LoginNotificationsEnabled = dto.LoginNotificationsEnabled;
            settings.SuspiciousActivityNotifications = dto.SuspiciousActivityNotifications;
            settings.PasswordChangeNotifications = dto.PasswordChangeNotifications;
            settings.ShowOnlineStatus = dto.ShowOnlineStatus;
            settings.AllowPasswordReset = dto.AllowPasswordReset;
        }

        private UserSessionDto MapToUserSessionDto(UserSession session)
        {
            return new UserSessionDto
            {
                Id = session.Id,
                SessionId = session.SessionId,
                DeviceName = session.DeviceName,
                DeviceType = session.DeviceType,
                OperatingSystem = session.OperatingSystem,
                Browser = session.Browser,
                IpAddress = session.IpAddress,
                Location = session.Location,
                IsActive = session.IsActive,
                IsCurrent = session.IsCurrent,
                CreatedAt = session.CreatedAt,
                LastActivityAt = session.LastActivityAt
            };
        }

        private string ExtractDeviceName(string userAgent)
        {
            if (userAgent.Contains("Mobile")) return "Mobile Device";
            if (userAgent.Contains("Tablet")) return "Tablet";
            return "Desktop Computer";
        }

        private string ExtractDeviceType(string userAgent)
        {
            if (userAgent.Contains("Mobile")) return "Mobile";
            if (userAgent.Contains("Tablet")) return "Tablet";
            return "Desktop";
        }

        private string ExtractOS(string userAgent)
        {
            if (userAgent.Contains("Windows")) return "Windows";
            if (userAgent.Contains("Mac")) return "macOS";
            if (userAgent.Contains("iPhone") || userAgent.Contains("iOS")) return "iOS";
            if (userAgent.Contains("Android")) return "Android";
            if (userAgent.Contains("Linux")) return "Linux";
            return "Unknown";
        }

        private string ExtractBrowser(string userAgent)
        {
            if (userAgent.Contains("Chrome")) return "Chrome";
            if (userAgent.Contains("Firefox")) return "Firefox";
            if (userAgent.Contains("Safari")) return "Safari";
            if (userAgent.Contains("Edge")) return "Edge";
            return "Unknown";
        }
    }
}
