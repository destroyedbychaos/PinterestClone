namespace PinterestClone.BLL.DTOs
{
    public class SocialPermissionsDto
    {
        public string MentionsSetting { get; set; } = "anyone";
        public string FriendsMessagesSetting { get; set; } = "inbox";
        public string FollowersMessagesSetting { get; set; } = "request";
        public string FollowingMessagesSetting { get; set; } = "inbox";
        public string EveryoneMessagesSetting { get; set; } = "dont_receive";
        public bool AllowComments { get; set; } = true;
        public bool FilterMyComments { get; set; } = true;
        public bool FilterOthersComments { get; set; } = false;
    }

    public class BlockedUserDto
    {
        public required string Id { get; set; }
        public required string UserName { get; set; }
        public required string DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime BlockedAt { get; set; }
    }

    public class KeywordFilterDto
    {
        public List<string> Keywords { get; set; } = new List<string>();
    }
}
