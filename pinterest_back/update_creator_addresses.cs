using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;

namespace PinterestClone.Scripts
{
    public static class UpdateCreatorAddresses
    {
        public static async Task UpdateExistingNFTs(AppDbContext context)
        {
            // Оновлюємо всі NFT, де CreatorWalletAddress порожній або null
            var nftsToUpdate = await context.NFTs
                .Where(n => string.IsNullOrEmpty(n.CreatorWalletAddress))
                .ToListAsync();

            foreach (var nft in nftsToUpdate)
            {
                nft.CreatorWalletAddress = nft.OwnerWalletAddress;
            }

            if (nftsToUpdate.Any())
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"Оновлено {nftsToUpdate.Count} NFT записів з CreatorWalletAddress");
            }
            else
            {
                Console.WriteLine("Всі NFT вже мають правильні CreatorWalletAddress");
            }
        }
    }
}