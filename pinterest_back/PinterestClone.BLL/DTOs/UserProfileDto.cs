using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Bio { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? Country { get; set; }
        public string? Language { get; set; }
        public bool IsProfilePublic { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsPhoneNumberVerified { get; set; }
        public bool SmsNotificationsEnabled { get; set; }
        public DateTime? PhoneNumberVerifiedAt { get; set; }

        // Додаємо нові поля
        public List<string> Interests { get; set; } = new();
        public List<string> Vibes { get; set; } = new();
        public bool OnboardingCompleted { get; set; }
        public DateTime? OnboardingCompletedAt { get; set; }

        // Існуючі поля
        public bool IsFollowing { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsBlockedBy { get; set; }
    }
     
}
