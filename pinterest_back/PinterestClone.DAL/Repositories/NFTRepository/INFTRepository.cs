using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.NFTRepository
{
    public interface INFTRepository
    {
        Task<IEnumerable<NFT>> GetUserNFTsAsync(string walletAddress, int page, int pageSize);
        Task<int> GetUserNFTsCountAsync(string walletAddress);
        Task<NFT?> GetByIdAsync(string nftId);
        Task<NFT> CreateAsync(NFT nft);
        Task<NFT> UpdateAsync(NFT nft);
        Task<bool> DeleteAsync(string nftId);
        Task<IEnumerable<NFT>> GetAllAsync(int page = 1, int pageSize = 20);
        Task<int> GetAllCountAsync();
    }
} 