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
        Task<ServiceResponse> GetByEmailAsync(string email);
        Task<ServiceResponse> GetByIdAsync(string id, bool includeRoles = false);
        Task<ServiceResponse> GetByUserNameAsync(string userName);
        Task<ServiceResponse> GetFollowersAsync(UserProfileDto user);
        Task<ServiceResponse> GetFollowingAsync(UserProfileDto user);
        Task<ServiceResponse> FollowUserAsync(string followerId, string targetId);
        Task<ServiceResponse> UnfollowUserAsync(string followerId, string targetId);
    }
}
