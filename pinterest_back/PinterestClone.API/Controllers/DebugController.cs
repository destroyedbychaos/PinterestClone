using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DebugController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("fix-creator-addresses")]
        public async Task<IActionResult> FixCreatorAddresses()
        {
            try
            {
                var sql = @"
                    UPDATE ""NFTs"" 
                    SET ""CreatorWalletAddress"" = ""OwnerWalletAddress"", 
                        ""UpdatedAt"" = NOW()
                    WHERE ""CreatorWalletAddress"" = '' OR ""CreatorWalletAddress"" IS NULL;
                ";

                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql);

                return Ok(new { 
                    success = true, 
                    message = $"Оновлено {rowsAffected} NFT записів",
                    rowsAffected = rowsAffected
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Помилка: {ex.Message}" 
                });
            }
        }

        [HttpGet("check-nft-status")]
        public async Task<IActionResult> CheckNFTStatus()
        {
            try
            {
                var totalNFTs = await _context.NFTs.CountAsync();
                var nftsWithEmptyCreator = await _context.NFTs
                    .CountAsync(n => string.IsNullOrEmpty(n.CreatorWalletAddress));
                
                var sampleNFTs = await _context.NFTs
                    .Select(n => new { 
                        n.Id, 
                        n.Name, 
                        n.OwnerWalletAddress, 
                        n.CreatorWalletAddress,
                        n.IsForSale,
                        n.IsMinted,
                        n.Price
                    })
                    .Take(10)
                    .ToListAsync();

                return Ok(new {
                    totalNFTs,
                    nftsWithCreator = totalNFTs - nftsWithEmptyCreator,
                    nftsWithEmptyCreator,
                    sampleNFTs
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Помилка: {ex.Message}" 
                });
            }
        }
    }
}