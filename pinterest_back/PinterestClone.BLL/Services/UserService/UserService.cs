using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.UserService
{
    /// <summary>
    ///  Сервіс відповідальний за користувачів.
    ///  --------------------------------------
    ///  Методи:
    ///   -- Отримати користувача за ID
    ///   -- Отримати користувача за email
    ///   -- Отримати користувача нікнеймом
    ///   -- Отримати підписників користувача
    ///   -- Отримати користувачів підписаних на певного користувача
    ///   -- Підписатися на користувача
    ///   -- Відписатися від користувача
    ///   -- Порахувати підписників користувача
    ///   -- Порахувати на скількох користувачів підписаний користувач
    ///   -- Перевірити чи заблокований користувач
    /// </summary>
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public UserService(UserManager<User> userManager, IUserRepository userRepository, IMapper mapper) 
        { 
            _userManager = userManager;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<ServiceResponse> GetAllUsers()
        {
            var users = _userManager.Users.ToList();

            if (users == null || users.Count == 0)
                return ServiceResponse.BadRequestResponse("No users found.");

            var userDtos = _mapper.Map<List<UserProfileDto>>(users);

            return ServiceResponse.OkResponse("Users found.", userDtos);
        }
        public async Task<ServiceResponse> GetByIdAsync(string id, bool includeRoles = false)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return ServiceResponse.BadRequestResponse($"User {id} was not found.");
            }

            var model = _mapper.Map<UserProfileDto>(user);

            return ServiceResponse.OkResponse($"User {model.UserName} was found.", model);
        }

        public async Task<ServiceResponse> GetByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return ServiceResponse.BadRequestResponse($"User {email} does not exist.");
            }

            var model = _mapper.Map<UserProfileDto>(user);

            return ServiceResponse.OkResponse($"User {email} found.", model);
        }

        public async Task<ServiceResponse> GetByUserNameAsync(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);

            if (user == null)
            {
                return ServiceResponse.OkResponse($"User {userName} not found.");
            }

            return ServiceResponse.OkResponse($"User {userName} found.", _mapper.Map<UserProfileDto>(user));
        }

        public async Task<ServiceResponse> GetFollowersAsync(UserProfileDto user)
        {
            var followers = await _userRepository.GetFollowersAsync(user.Id);

            if (followers == null || followers.Count == 0)
            {
                return ServiceResponse.OkResponse($"The user has no followers.");
            }

            var followersDto = _mapper.Map<List<UserProfileDto>>(followers);

            return ServiceResponse.OkResponse($"Followers found.", followersDto);
        }

        public async Task<ServiceResponse> GetFollowingAsync(UserProfileDto user)
        {
            var following = await _userRepository.GetFollowingAsync(user.Id);

            if (following == null || following.Count == 0)
            {
                return ServiceResponse.OkResponse($"The user follows no one.");
            }

            var followingDto = _mapper.Map<List<UserProfileDto>>(following);

            return ServiceResponse.OkResponse($"Following found.", followingDto);
        }

        public async Task<ServiceResponse> FollowUserAsync(string followerId, string targetUserId)
        {
            var follower = await _userRepository.GetByIdAsync(followerId);
            if (follower == null) return ServiceResponse.BadRequestResponse("Could not follow due to login issue.");

            var target = await _userRepository.GetByIdAsync(targetUserId);
            if (target == null) return ServiceResponse.BadRequestResponse("Could not follow due to incorrect UserId provided.");

            var success = await _userRepository.FollowUserAsync(followerId, targetUserId);

            if (!success) return ServiceResponse.BadRequestResponse("Could not follow the user.");

            return ServiceResponse.OkResponse("Followed successfully.");
        }

        public async Task<ServiceResponse> UnfollowUserAsync(string followerId, string targetUserId)
        {
            var follower = await _userRepository.GetByIdAsync(followerId);
            if (follower == null) return ServiceResponse.BadRequestResponse("Could not unfollow due to login issue.");

            var target = await _userRepository.GetByIdAsync(targetUserId);
            if (target == null) return ServiceResponse.BadRequestResponse("Could not unfollow due to incorrect UserId provided.");

            var success = await _userRepository.UnfollowUserAsync(followerId, targetUserId);

            if (!success) return ServiceResponse.BadRequestResponse("Could not unfollow the user.");

            return ServiceResponse.OkResponse("Unfollowed successfully.");
        }

        public async Task<ServiceResponse> IsFollowingAsync(string followerId, string targetId)
        {
            var isFollowing = await _userRepository.IsFollowingAsync(followerId, targetId);
            return ServiceResponse.OkResponse("Following status checked.", isFollowing);
        }

        public async Task<ServiceResponse> GetFollowersCountAsync(string userId)
        {
            var count = await _userRepository.GetFollowersCountAsync(userId);
            return ServiceResponse.OkResponse("Followers count retrieved.", count);
        }

        public async Task<ServiceResponse> GetFollowingCountAsync(string userId)
        {
            var count = await _userRepository.GetFollowingCountAsync(userId);
            return ServiceResponse.OkResponse("Following count retrieved.", count);
        }

        public async Task<ServiceResponse> IsBlockedAsync(string blockerId, string blockedUserId)
        {
            var isBlocked = await _userRepository.IsBlockedAsync(blockerId, blockedUserId);
            return ServiceResponse.OkResponse("Block status checked.", isBlocked);
        }

        public async Task<ServiceResponse<Web3UserProfileDto>> GetUserByWalletAddressAsync(string walletAddress)
        {
            try
            {
                var user = await _userRepository.GetByWalletAddressAsync(walletAddress);
                if (user == null)
                {
                    return ServiceResponse<Web3UserProfileDto>.NotFoundResponse("User not found");
                }

                var userDto = new Web3UserProfileDto
                {
                    WalletAddress = user.WalletAddress ?? "",
                    Nickname = user.DisplayName,
                    Bio = user.Bio,
                    AvatarUrl = user.AvatarUrl,
                    BannerUrl = user.BannerUrl,
                    Website = user.Website,
                    Twitter = user.Twitter,
                    Instagram = user.Instagram,
                    Discord = user.Discord,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return ServiceResponse<Web3UserProfileDto>.SuccessResponse(userDto, "User found");
            }
            catch (Exception ex)
            {
                return ServiceResponse<Web3UserProfileDto>.ErrorResponse($"Error getting user: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<Web3UserProfileDto>> UpdateUserProfileAsync(string walletAddress, UpdateUserProfileRequest request)
        {
            try
            {
                var user = await _userRepository.GetByWalletAddressAsync(walletAddress);
                if (user == null)
                {
                    return ServiceResponse<Web3UserProfileDto>.NotFoundResponse("User not found");
                }

                if (!string.IsNullOrEmpty(request.Nickname))
                    user.DisplayName = request.Nickname;
                if (!string.IsNullOrEmpty(request.Bio))
                    user.Bio = request.Bio;
                if (!string.IsNullOrEmpty(request.AvatarUrl))
                    user.AvatarUrl = request.AvatarUrl;
                if (!string.IsNullOrEmpty(request.BannerUrl))
                    user.BannerUrl = request.BannerUrl;
                if (!string.IsNullOrEmpty(request.Website))
                    user.Website = request.Website;
                if (!string.IsNullOrEmpty(request.Twitter))
                    user.Twitter = request.Twitter;
                if (!string.IsNullOrEmpty(request.Instagram))
                    user.Instagram = request.Instagram;
                if (!string.IsNullOrEmpty(request.Discord))
                    user.Discord = request.Discord;

                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);

                var userDto = new Web3UserProfileDto
                {
                    WalletAddress = user.WalletAddress ?? "",
                    Nickname = user.DisplayName,
                    Bio = user.Bio,
                    AvatarUrl = user.AvatarUrl,
                    BannerUrl = user.BannerUrl,
                    Website = user.Website,
                    Twitter = user.Twitter,
                    Instagram = user.Instagram,
                    Discord = user.Discord,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return ServiceResponse<Web3UserProfileDto>.SuccessResponse(userDto, "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse<Web3UserProfileDto>.ErrorResponse($"Error updating profile: {ex.Message}");
            }
        }
    }
}
