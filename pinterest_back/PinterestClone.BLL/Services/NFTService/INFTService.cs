using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.NFTService
{
    public interface INFTService
    {

        Task<ServiceResponse<NFTDto>> CreateNFTAsync(CreateNFTDto createNFTDto, string walletAddress, string imageUrl);
        Task<ServiceResponse<NFTListDto>> GetAllNFTsAsync(int page = 1, int pageSize = 20);
        Task<ServiceResponse<NFTDto>> GetNFTByIdAsync(string nftId);
        Task<ServiceResponse<NFTDto>> UpdateNFTAsync(string nftId, UpdateNFTDto updateNFTDto, string walletAddress, string? imageUrl = null);
        Task<ServiceResponse<bool>> DeleteNFTAsync(string nftId, string walletAddress, bool burnOnChain = false);
        

        Task<ServiceResponse<UserNFTsResponseDto>> GetUserNFTsAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<UserFavoritesResponseDto>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<bool>> AddToFavoritesAsync(string walletAddress, string nftId);
        Task<ServiceResponse<bool>> RemoveFromFavoritesAsync(string walletAddress, string nftId);
        

        Task<ServiceResponse<NFTMintResponseDto>> MintNFTAsync(string nftId, string walletAddress);
        Task<ServiceResponse<NFTBurnResponseDto>> BurnNFTAsync(string nftId, string walletAddress);
    }
} 