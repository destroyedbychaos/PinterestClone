using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.MarketplaceService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketplaceController : BaseController
    {
        private readonly IMarketplaceService _marketplaceService;

        public MarketplaceController(IMarketplaceService marketplaceService)
        {
            _marketplaceService = marketplaceService;
        }

        [HttpPost("list")]
        [Authorize]
        public async Task<IActionResult> ListNFTForSale([FromBody] ListNFTDto listNFTDto)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _marketplaceService.ListNFTForSaleAsync(listNFTDto, walletAddress);
            return GetResult(response);
        }

        [HttpDelete("list/{nftId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromSale(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _marketplaceService.RemoveFromSaleAsync(nftId, walletAddress);
            return GetResult(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllListings([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _marketplaceService.GetAllListingsAsync(page, pageSize);
            return GetResult(response);
        }

        [HttpGet("{nftId}")]
        public async Task<IActionResult> GetListingStatus(string nftId)
        {
            var response = await _marketplaceService.GetListingStatusAsync(nftId);
            return GetResult(response);
        }

        [HttpPost("buy/{nftId}")]
        [Authorize]
        public async Task<IActionResult> InitiatePurchase(string nftId, [FromBody] PurchaseRequestDto purchaseRequest)
        {
            var buyerWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerWalletAddress))
            {
                return Unauthorized();
            }

            var response = await _marketplaceService.InitiatePurchaseAsync(nftId, purchaseRequest, buyerWalletAddress);
            return GetResult(response);
        }

        [HttpPost("confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmPurchase([FromBody] ConfirmPurchaseDto confirmPurchaseDto)
        {
            var buyerWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerWalletAddress))
            {
                return Unauthorized();
            }

            var response = await _marketplaceService.ConfirmPurchaseAsync(confirmPurchaseDto, buyerWalletAddress);
            return GetResult(response);
        }
    }
} 