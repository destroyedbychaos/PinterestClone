using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.NFTService
{
    public interface INFTService
    {
        Task<ServiceResponse<UserNFTsResponseDto>> GetUserNFTsAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<UserFavoritesResponseDto>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<bool>> AddToFavoritesAsync(string walletAddress, string nftId);
        Task<ServiceResponse<bool>> RemoveFromFavoritesAsync(string walletAddress, string nftId);
    }
} 