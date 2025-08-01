using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.NFTRepository
{
    public interface INFTRepository
    {
        Task<NFT> CreateAsync(NFT nft);
        Task<IEnumerable<NFT>> GetAllAsync(int page = 1, int pageSize = 20);
        Task<int> GetAllCountAsync();
        Task<NFT?> GetByIdAsync(string nftId);
        Task<NFT?> UpdateAsync(NFT nft);
        Task<bool> DeleteAsync(string nftId);
        
        Task<IEnumerable<NFT>> GetUserNFTsAsync(string walletAddress, int page, int pageSize);
        Task<int> GetUserNFTsCountAsync(string walletAddress);
        Task<IEnumerable<NFT>> GetUserCreatedNFTsAsync(string walletAddress, int page, int pageSize);
        Task<int> GetUserCreatedNFTsCountAsync(string walletAddress);
        Task<List<NFT>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize);
        Task<int> GetUserFavoritesCountAsync(string walletAddress);
        Task<bool> AddToFavoritesAsync(string walletAddress, string nftId);
        Task<bool> RemoveFromFavoritesAsync(string walletAddress, string nftId);
        Task<bool> IsFavoriteAsync(string walletAddress, string nftId);
        
        Task<List<NFT>> GetByOwnerAsync(string walletAddress, int page, int pageSize);
        Task<int> GetCountByOwnerAsync(string walletAddress);
        
        Task<bool> UpdateTokenInfoAsync(string nftId, string tokenId, string contractAddress, string transactionHash);
        Task<bool> UpdateIPFSInfoAsync(string nftId, string ipfsMetadataHash, string ipfsImageHash);
    }
} 