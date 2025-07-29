using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.MarketplaceRepository
{
    public interface IMarketplaceRepository
    {
        Task<MarketplaceListing?> GetByIdAsync(string id);
        Task<MarketplaceListing?> GetByNFTIdAsync(string nftId);
        Task<MarketplaceListing?> GetActiveByNFTIdAsync(string nftId);
        Task<List<MarketplaceListing>> GetAllActiveAsync(int page, int pageSize);
        Task<int> GetActiveCountAsync();
        Task<MarketplaceListing> CreateAsync(MarketplaceListing listing);
        Task<MarketplaceListing?> UpdateAsync(MarketplaceListing listing);
        Task<bool> DeleteAsync(string id);
        Task<bool> DeactivateByNFTIdAsync(string nftId);
        Task<bool> MarkAsSoldAsync(string nftId, string buyerWalletAddress, string transactionHash);
    }
} 