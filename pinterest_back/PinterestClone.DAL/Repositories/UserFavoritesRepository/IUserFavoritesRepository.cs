using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.UserFavoritesRepository
{
    public interface IUserFavoritesRepository
    {
        Task<IEnumerable<NFT>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize);
        Task<int> GetUserFavoritesCountAsync(string walletAddress);
        Task<bool> IsFavoriteAsync(string walletAddress, string nftId);
        Task AddToFavoritesAsync(string walletAddress, string nftId);
        Task RemoveFromFavoritesAsync(string walletAddress, string nftId);
        Task<UserFavorite> CreateAsync(UserFavorite favorite);
        Task<bool> DeleteAsync(string id);
    }
} 