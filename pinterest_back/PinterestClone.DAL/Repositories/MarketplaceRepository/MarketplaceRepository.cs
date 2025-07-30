using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.MarketplaceRepository
{
    public class MarketplaceRepository : IMarketplaceRepository
    {
        private readonly AppDbContext _context;

        public MarketplaceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MarketplaceListing?> GetByIdAsync(string id)
        {
            return await _context.MarketplaceListings
                .Include(ml => ml.NFT)
                .FirstOrDefaultAsync(ml => ml.Id == id);
        }

        public async Task<MarketplaceListing?> GetByNFTIdAsync(string nftId)
        {
            return await _context.MarketplaceListings
                .Include(ml => ml.NFT)
                .FirstOrDefaultAsync(ml => ml.NFTId == nftId);
        }

        public async Task<MarketplaceListing?> GetActiveByNFTIdAsync(string nftId)
        {
            return await _context.MarketplaceListings
                .Include(ml => ml.NFT)
                .FirstOrDefaultAsync(ml => ml.NFTId == nftId && ml.IsActive);
        }

        public async Task<List<MarketplaceListing>> GetAllActiveAsync(int page, int pageSize)
        {
            return await _context.MarketplaceListings
                .Include(ml => ml.NFT)
                .Where(ml => ml.IsActive)
                .OrderByDescending(ml => ml.ListedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetActiveCountAsync()
        {
            return await _context.MarketplaceListings
                .Where(ml => ml.IsActive)
                .CountAsync();
        }

        public async Task<MarketplaceListing> CreateAsync(MarketplaceListing listing)
        {
            listing.Id = Guid.NewGuid().ToString();
            listing.ListedAt = DateTime.UtcNow;
            listing.IsActive = true;

            _context.MarketplaceListings.Add(listing);
            await _context.SaveChangesAsync();
            return listing;
        }

        public async Task<MarketplaceListing?> UpdateAsync(MarketplaceListing listing)
        {
            var existingListing = await _context.MarketplaceListings.FindAsync(listing.Id);
            if (existingListing == null)
                return null;

            _context.Entry(existingListing).CurrentValues.SetValues(listing);
            await _context.SaveChangesAsync();
            return existingListing;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var listing = await _context.MarketplaceListings.FindAsync(id);
            if (listing == null)
                return false;

            _context.MarketplaceListings.Remove(listing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateByNFTIdAsync(string nftId)
        {
            var listing = await _context.MarketplaceListings
                .FirstOrDefaultAsync(ml => ml.NFTId == nftId && ml.IsActive);
            
            if (listing == null)
                return false;

            listing.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAsSoldAsync(string nftId, string buyerWalletAddress, string transactionHash)
        {
            var listing = await _context.MarketplaceListings
                .FirstOrDefaultAsync(ml => ml.NFTId == nftId && ml.IsActive);
            
            if (listing == null)
                return false;

            listing.IsActive = false;
            listing.SoldAt = DateTime.UtcNow;
            listing.BuyerWalletAddress = buyerWalletAddress;
            listing.TransactionHash = transactionHash;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 