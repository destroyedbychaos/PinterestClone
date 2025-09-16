using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class SocialPermissions
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public User? User { get; set; }

        public string MentionsSetting { get; set; } = "anyone"; 

        // Messages settings
        public string FriendsMessagesSetting { get; set; } = "inbox"; 
        public string FollowersMessagesSetting { get; set; } = "request";
        public string FollowingMessagesSetting { get; set; } = "inbox";
        public string EveryoneMessagesSetting { get; set; } = "dont_receive";

        // Comments settings
        public bool AllowComments { get; set; } = true;
        public bool FilterMyComments { get; set; } = true;
        public bool FilterOthersComments { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
