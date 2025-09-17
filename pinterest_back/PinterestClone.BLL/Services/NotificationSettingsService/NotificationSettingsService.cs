using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.NotificationSettingsRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.NotificationSettingsService
{
    public class NotificationSettingsService : INotificationSettingsService
    {
        private readonly INotificationSettingsRepository _notificationSettingsRepository;
        private readonly IUserRepository _userRepository;

        public NotificationSettingsService(
            INotificationSettingsRepository notificationSettingsRepository,
            IUserRepository userRepository)
        {
            _notificationSettingsRepository = notificationSettingsRepository;
            _userRepository = userRepository;
        }

        public async Task<ServiceResponse> GetNotificationSettingsAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var settings = await _notificationSettingsRepository.GetByUserIdAsync(userId);
                
                if (settings == null)
                {

                    settings = new NotificationSettings
                    {
                        UserId = userId
                    };
                    settings = await _notificationSettingsRepository.CreateAsync(settings);
                }

                var dto = MapToDto(settings);
                return ServiceResponse.OkResponse("Notification settings retrieved successfully", dto);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving notification settings: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, NotificationSettingsDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var settings = await _notificationSettingsRepository.GetByUserIdAsync(userId);
                
                if (settings == null)
                {
                    settings = new NotificationSettings
                    {
                        UserId = userId
                    };
                    MapFromDto(dto, settings);
                    await _notificationSettingsRepository.CreateAsync(settings);
                }
                else
                {
                    MapFromDto(dto, settings);
                    await _notificationSettingsRepository.UpdateAsync(settings);
                }

                return ServiceResponse.OkResponse("Notification settings updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error updating notification settings: {ex.Message}");
            }
        }

        private NotificationSettingsDto MapToDto(NotificationSettings settings)
        {
            return new NotificationSettingsDto
            {

                SavesPush = settings.SavesPush,
                SavesInApp = settings.SavesInApp,
                LikesPush = settings.LikesPush,
                LikesInApp = settings.LikesInApp,
                CommentsPush = settings.CommentsPush,
                CommentsInApp = settings.CommentsInApp,

                CommentInteractionsPush = settings.CommentInteractionsPush,
                CommentInteractionsInApp = settings.CommentInteractionsInApp,
                MentionsPush = settings.MentionsPush,
                MentionsInApp = settings.MentionsInApp,
                RemindersPush = settings.RemindersPush,
                RemindersInApp = settings.RemindersInApp,

                NewAestsFromFollowedPush = settings.NewAestsFromFollowedPush,
                NewAestsFromFollowedInApp = settings.NewAestsFromFollowedInApp,
                NewAestsFromSuggestedPush = settings.NewAestsFromSuggestedPush,
                NewAestsFromSuggestedInApp = settings.NewAestsFromSuggestedInApp,

                BoardRecommendationsPush = settings.BoardRecommendationsPush,
                BoardRecommendationsInApp = settings.BoardRecommendationsInApp,
                BoardRecommendationsEmail = settings.BoardRecommendationsEmail,
                SearchRecommendationsPush = settings.SearchRecommendationsPush,
                SearchRecommendationsInApp = settings.SearchRecommendationsInApp,
                SearchRecommendationsEmail = settings.SearchRecommendationsEmail,

                AestsInspiredByActivityPush = settings.AestsInspiredByActivityPush,
                AestsInspiredByActivityInApp = settings.AestsInspiredByActivityInApp,
                AestsInspiredByActivityEmail = settings.AestsInspiredByActivityEmail,
                AestsPickedForYouPush = settings.AestsPickedForYouPush,
                AestsPickedForYouInApp = settings.AestsPickedForYouInApp,
                AestsPickedForYouEmail = settings.AestsPickedForYouEmail,
                PopularAestsPush = settings.PopularAestsPush,
                PopularAestsInApp = settings.PopularAestsInApp,
                PopularAestsEmail = settings.PopularAestsEmail,

                GroupBoardUpdatesPush = settings.GroupBoardUpdatesPush,
                GroupBoardUpdatesInApp = settings.GroupBoardUpdatesInApp,
                GroupBoardUpdatesEmail = settings.GroupBoardUpdatesEmail,
                GroupBoardInvitationsPush = settings.GroupBoardInvitationsPush,
                GroupBoardInvitationsInApp = settings.GroupBoardInvitationsInApp,
                GroupBoardInvitationsEmail = settings.GroupBoardInvitationsEmail,
                MessagesPush = settings.MessagesPush,
                MessagesInApp = settings.MessagesInApp,

                AestifyAnnouncementsEmail = settings.AestifyAnnouncementsEmail,
                SurveysAndQuizzesEmail = settings.SurveysAndQuizzesEmail,
                ReportsAndViolationsEmail = settings.ReportsAndViolationsEmail,

                PushEnabled = settings.PushEnabled,
                BrowserPushEnabled = settings.BrowserPushEnabled,
                InAppEnabled = settings.InAppEnabled,
                EmailEnabled = settings.EmailEnabled
            };
        }

        private void MapFromDto(NotificationSettingsDto dto, NotificationSettings settings)
        {

            settings.SavesPush = dto.SavesPush;
            settings.SavesInApp = dto.SavesInApp;
            settings.LikesPush = dto.LikesPush;
            settings.LikesInApp = dto.LikesInApp;
            settings.CommentsPush = dto.CommentsPush;
            settings.CommentsInApp = dto.CommentsInApp;

            settings.CommentInteractionsPush = dto.CommentInteractionsPush;
            settings.CommentInteractionsInApp = dto.CommentInteractionsInApp;
            settings.MentionsPush = dto.MentionsPush;
            settings.MentionsInApp = dto.MentionsInApp;
            settings.RemindersPush = dto.RemindersPush;
            settings.RemindersInApp = dto.RemindersInApp;

            settings.NewAestsFromFollowedPush = dto.NewAestsFromFollowedPush;
            settings.NewAestsFromFollowedInApp = dto.NewAestsFromFollowedInApp;
            settings.NewAestsFromSuggestedPush = dto.NewAestsFromSuggestedPush;
            settings.NewAestsFromSuggestedInApp = dto.NewAestsFromSuggestedInApp;

            settings.BoardRecommendationsPush = dto.BoardRecommendationsPush;
            settings.BoardRecommendationsInApp = dto.BoardRecommendationsInApp;
            settings.BoardRecommendationsEmail = dto.BoardRecommendationsEmail;
            settings.SearchRecommendationsPush = dto.SearchRecommendationsPush;
            settings.SearchRecommendationsInApp = dto.SearchRecommendationsInApp;
            settings.SearchRecommendationsEmail = dto.SearchRecommendationsEmail;

            settings.AestsInspiredByActivityPush = dto.AestsInspiredByActivityPush;
            settings.AestsInspiredByActivityInApp = dto.AestsInspiredByActivityInApp;
            settings.AestsInspiredByActivityEmail = dto.AestsInspiredByActivityEmail;
            settings.AestsPickedForYouPush = dto.AestsPickedForYouPush;
            settings.AestsPickedForYouInApp = dto.AestsPickedForYouInApp;
            settings.AestsPickedForYouEmail = dto.AestsPickedForYouEmail;
            settings.PopularAestsPush = dto.PopularAestsPush;
            settings.PopularAestsInApp = dto.PopularAestsInApp;
            settings.PopularAestsEmail = dto.PopularAestsEmail;

            settings.GroupBoardUpdatesPush = dto.GroupBoardUpdatesPush;
            settings.GroupBoardUpdatesInApp = dto.GroupBoardUpdatesInApp;
            settings.GroupBoardUpdatesEmail = dto.GroupBoardUpdatesEmail;
            settings.GroupBoardInvitationsPush = dto.GroupBoardInvitationsPush;
            settings.GroupBoardInvitationsInApp = dto.GroupBoardInvitationsInApp;
            settings.GroupBoardInvitationsEmail = dto.GroupBoardInvitationsEmail;
            settings.MessagesPush = dto.MessagesPush;
            settings.MessagesInApp = dto.MessagesInApp;

            settings.AestifyAnnouncementsEmail = dto.AestifyAnnouncementsEmail;
            settings.SurveysAndQuizzesEmail = dto.SurveysAndQuizzesEmail;
            settings.ReportsAndViolationsEmail = dto.ReportsAndViolationsEmail;

            settings.PushEnabled = dto.PushEnabled;
            settings.BrowserPushEnabled = dto.BrowserPushEnabled;
            settings.InAppEnabled = dto.InAppEnabled;
            settings.EmailEnabled = dto.EmailEnabled;
        }
    }
}
