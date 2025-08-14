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

            if (followers == null)
            {
                return ServiceResponse.OkResponse($"The user has no followers.");
            }

            var followersDto = _mapper.Map<List<UserProfileDto>>(followers);

            return ServiceResponse.OkResponse($"Folowers found.", followersDto);
        }

        public async Task<ServiceResponse> GetFollowingAsync(UserProfileDto user)
        {
            var following = await _userRepository.GetFollowingAsync(user.Id);

            if (following == null)
            {
                return ServiceResponse.OkResponse($"The user has follows no one.");
            }

            var followingDto = _mapper.Map<List<UserProfileDto>>(following);

            return ServiceResponse.OkResponse($"Following found.", followingDto);
        }

        public async Task<ServiceResponse> FollowUserAsync(string followerId, string targetUserId)
        {
            var follower = _userRepository.GetByIdAsync(followerId);
            if (follower == null) return ServiceResponse.BadRequestResponse("Could not follow due to login issue.");

            var target = _userRepository.GetByIdAsync(targetUserId);
            if (target == null) return ServiceResponse.BadRequestResponse("Could not follow due to incorrect UserId provided.");

            var success = await _userRepository.FollowUserAsync(followerId, targetUserId);

            if (!success) return ServiceResponse.BadRequestResponse("Could not follow the user.");

            return ServiceResponse.OkResponse("Followed successfully.");
        }

        public async Task<ServiceResponse> UnfollowUserAsync(string followerId, string targetUserId)
        {
            var follower = _userRepository.GetByIdAsync(followerId);
            if (follower == null) return ServiceResponse.BadRequestResponse("Could not unfollow due to login issue.");

            var target = _userRepository.GetByIdAsync(targetUserId);
            if (target == null) return ServiceResponse.BadRequestResponse("Could not unfollow due to incorrect UserId provided.");

            var success = await _userRepository.UnfollowUserAsync(followerId, targetUserId);

            if (!success) return ServiceResponse.BadRequestResponse("Could not unfollow the user.");

            return ServiceResponse.OkResponse("Unfollowed successfully.");
        }
    }
}
