using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
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

                var userProfile = MapToWeb3UserProfileDto(user);
                return ServiceResponse<Web3UserProfileDto>.SuccessResponse(userProfile);
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

                var updatedProfile = MapToWeb3UserProfileDto(user);
                return ServiceResponse<Web3UserProfileDto>.SuccessResponse(updatedProfile);
            }
            catch (Exception ex)
            {
                return ServiceResponse<Web3UserProfileDto>.ErrorResponse($"Error updating user profile: {ex.Message}");
            }
        }

        private Web3UserProfileDto MapToWeb3UserProfileDto(User user)
        {
            return new Web3UserProfileDto
            {
                WalletAddress = user.WalletAddress ?? string.Empty,
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