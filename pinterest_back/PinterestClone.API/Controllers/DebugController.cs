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

        [HttpDelete("nfts/without-image")]
        public async Task<IActionResult> DeleteNFTsWithoutImage()
        {
            try
            {
                var nfts = await _context.NFTs
                    .Where(n => string.IsNullOrEmpty(n.ImageUrl) || n.ImageUrl.Trim() == "")
                    .ToListAsync();

                _context.NFTs.RemoveRange(nfts);
                var rows = await _context.SaveChangesAsync();
                return Ok(new { success = true, deleted = rows });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }


        [HttpDelete("nfts/by-names")]
        public async Task<IActionResult> DeleteNFTsByNames([FromQuery] string names)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(names))
                    return BadRequest(new { success = false, message = "names is required (comma separated)" });

                var list = names.Split(',').Select(n => n.Trim()).Where(n => n.Length > 0).ToList();
                if (list.Count == 0) return Ok(new { success = true, deleted = 0 });

                var nfts = await _context.NFTs
                    .Where(n => list.Contains(n.Name))
                    .ToListAsync();

                _context.NFTs.RemoveRange(nfts);
                var rows = await _context.SaveChangesAsync();
                return Ok(new { success = true, deleted = rows, names = list });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("nfts/by-names-ci")]
        public async Task<IActionResult> DeleteNFTsByNamesCaseInsensitive([FromQuery] string names)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(names))
                    return BadRequest(new { success = false, message = "names is required (comma separated)" });

                var list = names
                    .Split(',')
                    .Select(n => n.Trim())
                    .Where(n => n.Length > 0)
                    .Select(n => n.ToLower())
                    .ToList();

                if (list.Count == 0) return Ok(new { success = true, deleted = 0 });

                var nfts = await _context.NFTs
                    .Where(n => n.Name != null && (
                        list.Contains(n.Name.ToLower()) ||
                        list.Any(x => n.Name.ToLower().Contains(x))
                    ))
                    .ToListAsync();

                var deletedInfo = nfts.Select(n => new { n.Id, n.Name }).ToList();
                _context.NFTs.RemoveRange(nfts);
                var rows = await _context.SaveChangesAsync();
                return Ok(new { success = true, deleted = rows, items = deletedInfo });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }


        [HttpGet("nfts/preview")]
        public async Task<IActionResult> PreviewDelete([FromQuery] string? names = null, [FromQuery] bool noImage = false)
        {
            try
            {
                var query = _context.NFTs.AsQueryable();

                if (noImage)
                {
                    query = query.Where(n => string.IsNullOrEmpty(n.ImageUrl)
                        || n.ImageUrl.Trim() == ""
                        || n.ImageUrl.ToLower() == "null"
                        || n.ImageUrl.ToLower() == "undefined"
                        || !(n.ImageUrl.StartsWith("http") || n.ImageUrl.StartsWith("ipfs://"))
                    );
                }

                if (!string.IsNullOrWhiteSpace(names))
                {
                    var list = names
                        .Split(',')
                        .Select(n => n.Trim().ToLower())
                        .Where(n => n.Length > 0)
                        .ToList();
                    if (list.Count > 0)
                    {
                        query = query.Where(n => n.Name != null && (
                            list.Contains(n.Name.ToLower()) ||
                            list.Any(x => n.Name.ToLower().Contains(x))
                        ));
                    }
                }

                var items = await query
                    .Select(n => new { n.Id, n.Name, n.ImageUrl, n.OwnerWalletAddress })
                    .ToListAsync();

                return Ok(new { success = true, total = items.Count, items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

 
        [HttpDelete("nfts/prune")]
        public async Task<IActionResult> Prune([FromQuery] string? names = null, [FromQuery] bool noImage = false)
        {
            try
            {
                var query = _context.NFTs.AsQueryable();

                if (noImage)
                {
                    query = query.Where(n => string.IsNullOrEmpty(n.ImageUrl)
                        || n.ImageUrl.Trim() == ""
                        || n.ImageUrl.ToLower() == "null"
                        || n.ImageUrl.ToLower() == "undefined"
                        || !(n.ImageUrl.StartsWith("http") || n.ImageUrl.StartsWith("ipfs://"))
                    );
                }

                if (!string.IsNullOrWhiteSpace(names))
                {
                    var list = names
                        .Split(',')
                        .Select(n => n.Trim().ToLower())
                        .Where(n => n.Length > 0)
                        .ToList();
                    if (list.Count > 0)
                    {
                        query = query.Where(n => n.Name != null && (
                            list.Contains(n.Name.ToLower()) ||
                            list.Any(x => n.Name.ToLower().Contains(x))
                        ));
                    }
                }

                var toDelete = await query.ToListAsync();
                var items = toDelete.Select(n => new { n.Id, n.Name }).ToList();
                _context.NFTs.RemoveRange(toDelete);
                var rows = await _context.SaveChangesAsync();
                return Ok(new { success = true, deleted = rows, items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("nfts/by-ids")]
        public async Task<IActionResult> DeleteByIds([FromQuery] string ids)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ids))
                {
                    return BadRequest(new { success = false, message = "ids is required (comma separated)" });
                }

                var idList = ids
                    .Split(',')
                    .Select(x => x.Trim())
                    .Where(x => x.Length > 0)
                    .ToList();

                if (idList.Count == 0)
                {
                    return Ok(new { success = true, deleted = 0 });
                }

                var nfts = await _context.NFTs
                    .Where(n => idList.Contains(n.Id))
                    .ToListAsync();

                if (nfts.Count == 0)
                {
                    return Ok(new { success = true, deleted = 0, message = "No NFTs matched the provided ids" });
                }

                var items = nfts.Select(n => new { n.Id, n.Name }).ToList();
                _context.NFTs.RemoveRange(nfts);
                var rows = await _context.SaveChangesAsync();
                return Ok(new { success = true, deleted = rows, items });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
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