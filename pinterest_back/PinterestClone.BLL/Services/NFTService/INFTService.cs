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
        Task<ServiceResponse<UserNFTsResponseDto>> GetUserCreatedNFTsAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<UserFavoritesResponseDto>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize);
        Task<ServiceResponse<bool>> AddToFavoritesAsync(string nftId, string walletAddress);
        Task<ServiceResponse<bool>> RemoveFromFavoritesAsync(string nftId, string walletAddress);
        Task<ServiceResponse<bool>> IsFavoriteAsync(string nftId, string walletAddress);



        Task<ServiceResponse<NFTDto>> UpdateMintedNFTAsync(string nftId, string walletAddress, int tokenId, string transactionHash);
        Task<ServiceResponse<NFTMintResponseDto>> MintNFTAsync(string nftId, string walletAddress);
        Task<ServiceResponse<NFTBurnResponseDto>> BurnNFTAsync(string nftId, string walletAddress);
    }
} 