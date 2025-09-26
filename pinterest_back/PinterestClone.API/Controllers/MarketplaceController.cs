using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.MarketplaceService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за роботу маркетплейсу NFT.
    /// ----------------------------------------------------
    /// Методи:
    ///     -- Виставлення NFT на продаж
    ///     -- Видалення NFT з продажу
    ///     -- Отримання всіх активних лістингів
    ///     -- Отримання статусу конкретного лістингу
    ///     -- Ініціація купівлі NFT
    ///     -- Підтвердження купівлі NFT
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class MarketplaceController : BaseController
    {
        private readonly IMarketplaceService _marketplaceService;

        public MarketplaceController(IMarketplaceService marketplaceService)
        {
            _marketplaceService = marketplaceService;
        }

        /// <summary>
        /// Виставляє NFT на продаж.
        /// </summary>
        /// <param name="listNFTDto">Модель з даними NFT для продажу.</param>
        /// <returns><see cref="IActionResult"/> з результатом виставлення на продаж.</returns>
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

        /// <summary>
        /// Видаляє NFT з продажу.
        /// </summary>
        /// <param name="nftId">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення з продажу.</returns>
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

        /// <summary>
        /// Отримує всі активні лістинги.
        /// </summary>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком лістингів.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllListings([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _marketplaceService.GetAllListingsAsync(page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує статусу лістингу за ідентифікатором NFT.
        /// </summary>
        /// <param name="nftId">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> зі статусом лістингу.</returns>
        [HttpGet("{nftId}")]
        public async Task<IActionResult> GetListingStatus(string nftId)
        {
            var response = await _marketplaceService.GetListingStatusAsync(nftId);
            return GetResult(response);
        }

        /// <summary>
        /// Ініціаціює купівлю NFT.
        /// </summary>
        /// <param name="nftId">ID NFT.</param>
        /// <param name="purchaseRequest">Модель з даними для купівлі.</param>
        /// <returns><see cref="IActionResult"/> з результатом ініціації купівлі.</returns>
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

        /// <summary>
        /// Підтверджує купівлю NFT.
        /// </summary>
        /// <param name="confirmPurchaseDto">Модель підтвердження купівлі.</param>
        /// <returns><see cref="IActionResult"/> з результатом підтвердження купівлі.</returns>
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