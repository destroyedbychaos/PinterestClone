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
            return await _context.NFTs.CountAsync();
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

        public async Task<bool> UpdateTokenInfoAsync(string nftId, string tokenId, string contractAddress, string transactionHash)
        {
            var nft = await _context.NFTs.FindAsync(nftId);
            if (nft == null)
                return false;

            nft.TokenId = tokenId;
            nft.ContractAddress = contractAddress;
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
    }
} 