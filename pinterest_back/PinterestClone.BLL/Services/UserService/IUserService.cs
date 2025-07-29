using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.UserService
{
    public interface IUserService
    {
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