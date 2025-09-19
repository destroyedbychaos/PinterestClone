using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.NFTRepository
{
    public class NFTRepository : INFTRepository
    {
        private readonly AppDbContext _context;

        public NFTRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task<NFT> CreateAsync(NFT nft)
        {
            nft.Id = Guid.NewGuid().ToString();
            nft.CreatedAt = DateTime.UtcNow;
            nft.UpdatedAt = DateTime.UtcNow;
            await _context.NFTs.AddAsync(nft);
            await _context.SaveChangesAsync();
            return nft;
        }

        public async Task<IEnumerable<NFT>> GetAllAsync(int page = 1, int pageSize = 20)
        {
            var skip = (page - 1) * pageSize;
            
            return await _context.NFTs
                .OrderByDescending(nft => nft.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetAllCountAsync()
        {
            return await _context.NFTs
                .CountAsync();
        }

        public async Task<NFT?> GetByIdAsync(string nftId)
        {
            return await _context.NFTs
                .FirstOrDefaultAsync(nft => nft.Id == nftId);
        }

        public async Task<NFT?> UpdateAsync(NFT nft)
        {
            var existingNft = await _context.NFTs.FindAsync(nft.Id);
            if (existingNft == null)
                return null;

            existingNft.Name = nft.Name;
            existingNft.Description = nft.Description;
            existingNft.ImageUrl = nft.ImageUrl;
            existingNft.Price = nft.Price;
            existingNft.Currency = nft.Currency;
            existingNft.IsForSale = nft.IsForSale;
            existingNft.UpdatedAt = DateTime.UtcNow;

            _context.NFTs.Update(existingNft);
            await _context.SaveChangesAsync();
            return existingNft;
        }

        public async Task<bool> DeleteAsync(string nftId)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            _context.NFTs.Remove(nft);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<NFT>> GetUserNFTsAsync(string walletAddress, int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            
            return await _context.NFTs
                .Where(nft => nft.OwnerWalletAddress.ToLower() == walletAddress.ToLower())
                .OrderByDescending(nft => nft.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUserNFTsCountAsync(string walletAddress)
        {
            return await _context.NFTs
                .Where(nft => nft.OwnerWalletAddress.ToLower() == walletAddress.ToLower())
                .CountAsync();
        }


        public async Task<IEnumerable<NFT>> GetUserCreatedNFTsAsync(string walletAddress, int page, int pageSize)
        {
            var skip = (page - 1) * pageSize;
            
            return await _context.NFTs
                .Where(nft => nft.CreatorWalletAddress.ToLower() == walletAddress.ToLower())
                .OrderByDescending(nft => nft.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUserCreatedNFTsCountAsync(string walletAddress)
        {
            return await _context.NFTs
                .Where(nft => nft.CreatorWalletAddress.ToLower() == walletAddress.ToLower())
                .CountAsync();
        }

        public async Task<bool> UpdateTokenInfoAsync(string nftId, string tokenId, string contractAddress, string transactionHash)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            nft.TokenId = tokenId;
            nft.ContractAddress = contractAddress;
            nft.IsMinted = true; 
            nft.UpdatedAt = DateTime.UtcNow;

            _context.NFTs.Update(nft);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateIPFSInfoAsync(string nftId, string ipfsMetadataHash, string ipfsImageHash)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            nft.Description = $"{nft.Description}\nIPFS Metadata: {ipfsMetadataHash}\nIPFS Image: {ipfsImageHash}";
            nft.UpdatedAt = DateTime.UtcNow;

            _context.NFTs.Update(nft);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TransferOwnershipAsync(string nftId, string newOwnerWalletAddress)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            nft.OwnerWalletAddress = newOwnerWalletAddress;
            nft.UpdatedAt = DateTime.UtcNow;
            _context.NFTs.Update(nft);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSaleStatusAsync(string nftId, bool isForSale, decimal? price = null, string? currency = null)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            nft.IsForSale = isForSale;
            if (price.HasValue)
            {
                nft.Price = price.Value;
            }
            if (!string.IsNullOrEmpty(currency))
            {
                nft.Currency = currency;
            }
            nft.UpdatedAt = DateTime.UtcNow;
            _context.NFTs.Update(nft);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<NFT>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize)
        {
            return await _context.NFTs
                .Include(n => n.UserFavorites)
                .Where(n => n.UserFavorites.Any(uf => uf.UserWalletAddress == walletAddress))
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUserFavoritesCountAsync(string walletAddress)
        {
            return await _context.NFTs
                .Include(n => n.UserFavorites)
                .Where(n => n.UserFavorites.Any(uf => uf.UserWalletAddress == walletAddress))
                .CountAsync();
        }

        public async Task<bool> AddToFavoritesAsync(string walletAddress, string nftId)
        {
            var existingFavorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserWalletAddress == walletAddress && uf.NFTId == nftId);
            
            if (existingFavorite != null)
                return false;

            var favorite = new UserFavorite
            {
                Id = Guid.NewGuid().ToString(),
                UserWalletAddress = walletAddress,
                NFTId = nftId,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserFavorites.Add(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromFavoritesAsync(string walletAddress, string nftId)
        {
            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserWalletAddress == walletAddress && uf.NFTId == nftId);
            
            if (favorite == null)
                return false;

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavoriteAsync(string walletAddress, string nftId)
        {
            return await _context.UserFavorites
                .AnyAsync(uf => uf.UserWalletAddress == walletAddress && uf.NFTId == nftId);
        }

        public async Task<List<NFT>> GetByOwnerAsync(string walletAddress, int page, int pageSize)
        {
            return await _context.NFTs
                .Where(n => n.OwnerWalletAddress == walletAddress)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCountByOwnerAsync(string walletAddress)
        {
            return await _context.NFTs
                .Where(n => n.OwnerWalletAddress == walletAddress)
                .CountAsync();
        }
    }
} 