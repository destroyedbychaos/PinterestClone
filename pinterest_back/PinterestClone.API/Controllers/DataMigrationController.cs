using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для виконання міграційних операцій над даними NFT.
    /// ------------------------------------------------------------
    /// Методи:
    ///     -- Оновлення поля CreatorWalletAddress для NFT
    ///     -- Перевірка стану даних NFT
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DataMigrationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DataMigrationController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Оновлює всі NFT-записи, у яких поле CreatorWalletAddress порожнє, встановлюючи його значення рівним OwnerWalletAddress.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з інформацією про кількість оновлених записів.
        /// </returns>
        [HttpPost("update-creator-addresses")]
        public async Task<IActionResult> UpdateCreatorAddresses()
        {
            try
            {
                var nftsToUpdate = await _context.NFTs
                    .Where(n => string.IsNullOrEmpty(n.CreatorWalletAddress))
                    .ToListAsync();

                if (nftsToUpdate.Any())
                {
                    foreach (var nft in nftsToUpdate)
                    {
                        nft.CreatorWalletAddress = nft.OwnerWalletAddress;
                        nft.UpdatedAt = DateTime.UtcNow;
                    }

                    await _context.SaveChangesAsync();

                    return Ok(new { 
                        success = true, 
                        message = $"Оновлено {nftsToUpdate.Count} NFT записів з CreatorWalletAddress",
                        updatedCount = nftsToUpdate.Count
                    });
                }
                else
                {
                    return Ok(new { 
                        success = true, 
                        message = "Всі NFT вже мають правильні CreatorWalletAddress",
                        updatedCount = 0
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Помилка оновлення: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// Перевіряє стан даних NFT.
        /// </summary>
        /// <returns>
        /// <see cref="IActionResult"/> з аналітикою по NFT-даним.
        /// </returns>
        [HttpGet("check-nft-data")]
        public async Task<IActionResult> CheckNFTData()
        {
            try
            {
                var totalNFTs = await _context.NFTs.CountAsync();
                var nftsWithEmptyCreator = await _context.NFTs
                    .Where(n => string.IsNullOrEmpty(n.CreatorWalletAddress))
                    .CountAsync();
                var nftsWithCreator = totalNFTs - nftsWithEmptyCreator;

                var sampleNFTs = await _context.NFTs
                    .Select(n => new { 
                        n.Id, 
                        n.Name, 
                        n.OwnerWalletAddress, 
                        n.CreatorWalletAddress 
                    })
                    .Take(5)
                    .ToListAsync();

                return Ok(new {
                    totalNFTs,
                    nftsWithCreator,
                    nftsWithEmptyCreator,
                    sampleNFTs
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Помилка перевірки: {ex.Message}" 
                });
            }
        }
    }
}