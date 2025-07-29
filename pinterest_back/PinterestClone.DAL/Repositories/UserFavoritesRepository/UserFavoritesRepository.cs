using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.UserFavoritesRepository
{
    public class UserFavoritesRepository : IUserFavoritesRepository
    {
        private readonly AppDbContext _context;

        public UserFavoritesRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NFT>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            
            return await _context.UserFavorites
                .Where(fav => fav.UserWalletAddress.ToLower() == walletAddress.ToLower())
                .Include(fav => fav.NFT)
                .OrderByDescending(fav => fav.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(fav => fav.NFT)
                .ToListAsync();
        }

        public async Task<int> GetUserFavoritesCountAsync(string walletAddress)
        {
            return await _context.UserFavorites
                .Where(fav => fav.UserWalletAddress.ToLower() == walletAddress.ToLower())
                .CountAsync();
        }

        public async Task<bool> IsFavoriteAsync(string walletAddress, string nftId)
        {
            return await _context.UserFavorites
                .AnyAsync(fav => fav.UserWalletAddress.ToLower() == walletAddress.ToLower() && fav.NFTId == nftId);
        }

        public async Task AddToFavoritesAsync(string walletAddress, string nftId)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                throw new ArgumentException("NFT не знайдено");

            var existingFavorite = await _context.UserFavorites
                .FirstOrDefaultAsync(fav => fav.UserWalletAddress.ToLower() == walletAddress.ToLower() && fav.NFTId == nftId);

            if (existingFavorite != null)
                return; 

            var favorite = new UserFavorite
            {
                Id = Guid.NewGuid().ToString(),
                UserWalletAddress = walletAddress,
                NFTId = nftId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.UserFavorites.AddAsync(favorite);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveFromFavoritesAsync(string walletAddress, string nftId)
        {
            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(fav => fav.UserWalletAddress.ToLower() == walletAddress.ToLower() && fav.NFTId == nftId);

            if (favorite != null)
            {
                _context.UserFavorites.Remove(favorite);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<UserFavorite> CreateAsync(UserFavorite favorite)
        {
            await _context.UserFavorites.AddAsync(favorite);
            await _context.SaveChangesAsync();
            return favorite;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var favorite = await _context.UserFavorites.FindAsync(id);
            if (favorite == null)
                return false;

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 