using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.UserBlockService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.SocialPermissionsRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.SocialPermissionsService
{
    public class SocialPermissionsService : ISocialPermissionsService
    {
        private readonly ISocialPermissionsRepository _socialPermissionsRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUserBlockService _userBlockService;

        public SocialPermissionsService(
            ISocialPermissionsRepository socialPermissionsRepository,
            IUserRepository userRepository,
            IUserBlockService userBlockService)
        {
            _socialPermissionsRepository = socialPermissionsRepository;
            _userRepository = userRepository;
            _userBlockService = userBlockService;
        }

        public async Task<ServiceResponse> GetSocialPermissionsAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var permissions = await _socialPermissionsRepository.GetByUserIdAsync(userId);
                
                if (permissions == null)
                {

                    permissions = new SocialPermissions
                    {
                        UserId = userId
                    };
                    permissions = await _socialPermissionsRepository.CreateAsync(permissions);
                }

                var dto = new SocialPermissionsDto
                {
                    MentionsSetting = permissions.MentionsSetting,
                    FriendsMessagesSetting = permissions.FriendsMessagesSetting,
                    FollowersMessagesSetting = permissions.FollowersMessagesSetting,
                    FollowingMessagesSetting = permissions.FollowingMessagesSetting,
                    EveryoneMessagesSetting = permissions.EveryoneMessagesSetting,
                    AllowComments = permissions.AllowComments,
                    FilterMyComments = permissions.FilterMyComments,
                    FilterOthersComments = permissions.FilterOthersComments
                };

                return ServiceResponse.OkResponse("Social permissions retrieved successfully", dto);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving social permissions: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> UpdateSocialPermissionsAsync(string userId, SocialPermissionsDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var permissions = await _socialPermissionsRepository.GetByUserIdAsync(userId);
                
                if (permissions == null)
                {
                    permissions = new SocialPermissions
                    {
                        UserId = userId,
                        MentionsSetting = dto.MentionsSetting,
                        FriendsMessagesSetting = dto.FriendsMessagesSetting,
                        FollowersMessagesSetting = dto.FollowersMessagesSetting,
                        FollowingMessagesSetting = dto.FollowingMessagesSetting,
                        EveryoneMessagesSetting = dto.EveryoneMessagesSetting,
                        AllowComments = dto.AllowComments,
                        FilterMyComments = dto.FilterMyComments,
                        FilterOthersComments = dto.FilterOthersComments
                    };
                    await _socialPermissionsRepository.CreateAsync(permissions);
                }
                else
                {
                    permissions.MentionsSetting = dto.MentionsSetting;
                    permissions.FriendsMessagesSetting = dto.FriendsMessagesSetting;
                    permissions.FollowersMessagesSetting = dto.FollowersMessagesSetting;
                    permissions.FollowingMessagesSetting = dto.FollowingMessagesSetting;
                    permissions.EveryoneMessagesSetting = dto.EveryoneMessagesSetting;
                    permissions.AllowComments = dto.AllowComments;
                    permissions.FilterMyComments = dto.FilterMyComments;
                    permissions.FilterOthersComments = dto.FilterOthersComments;
                    permissions.UpdatedAt = DateTime.UtcNow;
                    
                    await _socialPermissionsRepository.UpdateAsync(permissions);
                }

                return ServiceResponse.OkResponse("Social permissions updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error updating social permissions: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetBlockedUsersAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                // Використовуємо UserBlockService для отримання заблокованих користувачів
                var blockedUsersResponse = await _userBlockService.GetBlockedUsersAsync(userId);
                if (!blockedUsersResponse.Success)
                {
                    return ServiceResponse.BadRequestResponse(blockedUsersResponse.Message);
                }

                var blockedUsers = (IEnumerable<UserBlock>)blockedUsersResponse.Payload;
                
                var blockedUserDtos = blockedUsers.Select(bu => new BlockedUserDto
                {
                    Id = bu.BlockedUserId,
                    UserName = bu.BlockedUser?.UserName ?? "Unknown",
                    DisplayName = bu.BlockedUser?.DisplayName ?? "Unknown User",
                    AvatarUrl = bu.BlockedUser?.AvatarUrl,
                    BlockedAt = bu.BlockedAt
                }).ToList();

                return ServiceResponse.OkResponse("Blocked users retrieved successfully", blockedUserDtos);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving blocked users: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> BlockUserAsync(string blockerId, string blockedUserId)
        {
            try
            {
                // Використовуємо UserBlockService для блокування
                return await _userBlockService.BlockUserAsync(blockerId, blockedUserId);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error blocking user: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> UnblockUserAsync(string blockerId, string blockedUserId)
        {
            try
            {
                // Використовуємо UserBlockService для розблокування
                return await _userBlockService.UnblockUserAsync(blockerId, blockedUserId);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error unblocking user: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetKeywordFiltersAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var keywordFilters = await _socialPermissionsRepository.GetKeywordFiltersAsync(userId);
                
                var dto = new KeywordFilterDto
                {
                    Keywords = keywordFilters.Select(kf => kf.Keyword).ToList()
                };

                return ServiceResponse.OkResponse("Keyword filters retrieved successfully", dto);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error retrieving keyword filters: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> UpdateKeywordFiltersAsync(string userId, KeywordFilterDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                await _socialPermissionsRepository.ClearKeywordFiltersAsync(userId);

                foreach (var keyword in dto.Keywords.Where(k => !string.IsNullOrWhiteSpace(k)))
                {
                    await _socialPermissionsRepository.AddKeywordFilterAsync(userId, keyword.Trim());
                }

                return ServiceResponse.OkResponse("Keyword filters updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error updating keyword filters: {ex.Message}");
            }
        }
    }
}
