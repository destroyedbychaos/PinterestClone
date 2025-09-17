namespace PinterestClone.BLL.DTOs
{
    public class SecuritySettingsDto
    {

        public bool GoogleLoginEnabled { get; set; } = true;
        public bool FacebookLoginEnabled { get; set; } = false;
        public bool AppleLoginEnabled { get; set; } = false;

        public bool TwoFactorEnabled { get; set; } = false;
        public bool SmsBackupEnabled { get; set; } = false;
        public bool EmailBackupEnabled { get; set; } = true;

        public bool LoginNotificationsEnabled { get; set; } = true;
        public bool SuspiciousActivityNotifications { get; set; } = true;
        public bool PasswordChangeNotifications { get; set; } = true;

        public bool ShowOnlineStatus { get; set; } = true;
        public bool AllowPasswordReset { get; set; } = true;
    }

    public class UserSessionDto
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string? DeviceType { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Browser { get; set; }
        public string? IpAddress { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActivityAt { get; set; }
    }

    public class ConnectedAppDto
    {
        public int Id { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string? AppIcon { get; set; }
        public string? Description { get; set; }
        public DateTime ConnectedAt { get; set; }
        public DateTime LastUsedAt { get; set; }
        public List<string> Permissions { get; set; } = new();
    }
}
