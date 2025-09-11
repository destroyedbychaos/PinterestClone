using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace PinterestClone.DAL.Models.Identity
{
    public class User : IdentityUser
    {
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Bio { get; set; }

        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? Country { get; set; }
        public string? Language { get; set; }
        public bool IsProfilePublic { get; set; } = true;
        public bool IsSearchPrivate { get; set; } = false;

        public new string? PhoneNumber { get; set; }
        public bool IsPhoneNumberVerified { get; set; } = false;
        public bool SmsNotificationsEnabled { get; set; } = true;
        public DateTime? PhoneNumberVerifiedAt { get; set; }

        public string? Interests { get; set; }
        public string? Vibes { get; set; }
        public bool OnboardingCompleted { get; set; } = false;
        public DateTime? OnboardingCompletedAt { get; set; }

        public virtual ICollection<Board> Boards { get; set; } = [];
        public virtual ICollection<Pin> Pins { get; set; } = [];
        public virtual ICollection<Comment> Comments { get; set; } = [];
        public virtual ICollection<Like> Likes { get; set; } = [];
        public ICollection<UserFollow> FollowingRelations { get; set; } = new List<UserFollow>();
        public ICollection<UserFollow> FollowerRelations { get; set; } = new List<UserFollow>();

        [NotMapped]
        public ICollection<User> Following => FollowingRelations.Select(f => f.Following).ToList();
        [NotMapped]
        public ICollection<User> Followers => FollowerRelations.Select(f => f.Follower).ToList();

        [NotMapped]
        public List<string> InterestsList
        {
            get => string.IsNullOrEmpty(Interests) ? new List<string>() :
                   System.Text.Json.JsonSerializer.Deserialize<List<string>>(Interests) ?? new List<string>();
            set => Interests = value?.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(value) : null;
        }

        [NotMapped]
        public List<string> VibesList
        {
            get => string.IsNullOrEmpty(Vibes) ? new List<string>() :
                   System.Text.Json.JsonSerializer.Deserialize<List<string>>(Vibes) ?? new List<string>();
            set => Vibes = value?.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(value) : null;
        }

        public virtual ICollection<UserClaim> Claims { get; set; } = [];
        public virtual ICollection<UserLogin> Logins { get; set; } = [];
        public virtual ICollection<UserToken> Tokens { get; set; } = [];
    }
}