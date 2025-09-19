using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.BLL.Services.UserService
{
    public interface IUserService
    {
        Task<ServiceResponse> GetAllUsers();
        Task<ServiceResponse> GetByEmailAsync(string email);
        Task<ServiceResponse> GetByIdAsync(string id, bool includeRoles = false);
        Task<ServiceResponse> GetByUserNameAsync(string userName);
        Task<ServiceResponse> GetFollowersAsync(UserProfileDto user);
        Task<ServiceResponse> GetFollowingAsync(UserProfileDto user);
        Task<ServiceResponse> FollowUserAsync(string followerId, string targetId);
        Task<ServiceResponse> UnfollowUserAsync(string followerId, string targetId);
        Task<ServiceResponse> IsFollowingAsync(string followerId, string targetId);
        Task<ServiceResponse> GetFollowersCountAsync(string userId);
        Task<ServiceResponse> GetFollowingCountAsync(string userId);
        Task<ServiceResponse> IsBlockedAsync(string blockerId, string blockedUserId);
        Task<ServiceResponse<Web3UserProfileDto>> GetUserByWalletAddressAsync(string walletAddress);
        Task<ServiceResponse<Web3UserProfileDto>> UpdateUserProfileAsync(string walletAddress, UpdateUserProfileRequest request);
    }

    public class UpdateUserProfileRequest
    {
        public string? Nickname { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public string? Discord { get; set; }
    }
}
