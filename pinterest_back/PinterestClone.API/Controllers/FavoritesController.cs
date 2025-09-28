using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.Services.PinService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за операції зі збереженням пінів та NFT.
    /// ----------------------------------------------------------
    /// Методи:
    ///     -- Отримати збережені користувачем піни
    ///     -- Додати NFT у улюблені
    ///     -- Видалити NFT з улюблених
    ///     -- Отримати власні улюблені NFT
    ///     -- Перевірити, чи NFT у улюблених
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : BaseController
    {
        private readonly INFTService _nftService;
        private readonly IPinService _pinService;

        public FavoritesController(INFTService nftService, IPinService pinService)
        {
            _nftService = nftService;
            _pinService = pinService;
        }

        /// <summary>
        /// Отримує збережені користувачем піни.
        /// </summary>
        /// <param name="username">Нікнейм користувача.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Розмір сторінки (за замовчуванням 20, максимум 100).</param>
        /// <returns><see cref="ActionResult{PinListDto}"/> зі списком пінів користувача.</returns>
        [HttpGet("user/{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<PinListDto>> GetUserSavedPins(
            string username,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var pins = await _pinService.GetUserPinsByUsernameAsync(username, pageNumber, pageSize);
                
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user saved pins: {ex.Message}");
            }
        }

        /// <summary>
        /// Додає NFT у улюблені користувача.
        /// </summary>
        /// <param name="nftId">Ідентифікатор NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом операції.</returns>
        [HttpPost("{nftId}/add")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.AddToFavoritesAsync(nftId, walletAddress);
            return GetResult(response);
        }

        /// <summary>
        /// Видаляє NFT з улюблених користувача.
        /// </summary>
        /// <param name="nftId">Ідентифікатор NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом операції.</returns>
        [HttpDelete("{nftId}/remove")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.RemoveFromFavoritesAsync(nftId, walletAddress);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує список власних улюблених NFT користувача.
        /// </summary>
        /// <param name="page">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Розмір сторінки (за замовчуванням 20).</param>
        /// <returns><see cref="IActionResult"/> зі списком улюблених NFT.</returns>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.GetUserFavoritesAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Перевіряє, чи NFT знаходиться у списку улюблених користувача.
        /// </summary>
        /// <param name="nftId">Ідентифікатор NFT.</param>
        /// <returns><see cref="IActionResult"/> з інформацією, чи NFT у улюблених.</returns>
        [HttpGet("{nftId}/is-favorite")]
        [Authorize]
        public async Task<IActionResult> IsFavorite(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.IsFavoriteAsync(nftId, walletAddress);
            return GetResult(response);
        }
    }
} 