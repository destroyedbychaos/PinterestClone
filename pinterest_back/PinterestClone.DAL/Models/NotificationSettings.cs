using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class NotificationSettings
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public User? User { get; set; }

        public bool SavesPush { get; set; } = true;
        public bool SavesInApp { get; set; } = true;
        
        public bool LikesPush { get; set; } = true;
        public bool LikesInApp { get; set; } = true;
        
        public bool CommentsPush { get; set; } = true;
        public bool CommentsInApp { get; set; } = true;

        public bool CommentInteractionsPush { get; set; } = true;
        public bool CommentInteractionsInApp { get; set; } = true;
        
        public bool MentionsPush { get; set; } = true;
        public bool MentionsInApp { get; set; } = true;
        
        public bool RemindersPush { get; set; } = false;
        public bool RemindersInApp { get; set; } = false;

        public bool NewAestsFromFollowedPush { get; set; } = true;
        public bool NewAestsFromFollowedInApp { get; set; } = false;
        
        public bool NewAestsFromSuggestedPush { get; set; } = false;
        public bool NewAestsFromSuggestedInApp { get; set; } = false;

        public bool BoardRecommendationsPush { get; set; } = true;
        public bool BoardRecommendationsInApp { get; set; } = true;
        public bool BoardRecommendationsEmail { get; set; } = false;
        
        public bool SearchRecommendationsPush { get; set; } = true;
        public bool SearchRecommendationsInApp { get; set; } = true;
        public bool SearchRecommendationsEmail { get; set; } = false;

        public bool AestsInspiredByActivityPush { get; set; } = false;
        public bool AestsInspiredByActivityInApp { get; set; } = false;
        public bool AestsInspiredByActivityEmail { get; set; } = false;
        
        public bool AestsPickedForYouPush { get; set; } = true;
        public bool AestsPickedForYouInApp { get; set; } = true;
        public bool AestsPickedForYouEmail { get; set; } = true;
        
        public bool PopularAestsPush { get; set; } = false;
        public bool PopularAestsInApp { get; set; } = false;
        public bool PopularAestsEmail { get; set; } = true;

        public bool GroupBoardUpdatesPush { get; set; } = false;
        public bool GroupBoardUpdatesInApp { get; set; } = false;
        public bool GroupBoardUpdatesEmail { get; set; } = true;
        
        public bool GroupBoardInvitationsPush { get; set; } = true;
        public bool GroupBoardInvitationsInApp { get; set; } = true;
        public bool GroupBoardInvitationsEmail { get; set; } = false;
        
        public bool MessagesPush { get; set; } = true;
        public bool MessagesInApp { get; set; } = true;

        public bool AestifyAnnouncementsEmail { get; set; } = true;
        public bool SurveysAndQuizzesEmail { get; set; } = true;
        public bool ReportsAndViolationsEmail { get; set; } = true;

        public bool PushEnabled { get; set; } = true;
        public bool BrowserPushEnabled { get; set; } = true;
        public bool InAppEnabled { get; set; } = true;
        public bool EmailEnabled { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
