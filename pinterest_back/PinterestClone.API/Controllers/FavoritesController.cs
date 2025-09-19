using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за операції зі збереженням пінів та NFT.
    /// ----------------------------------------------------------
    /// Методи:
    ///     -- Отримати збережені користувачем піни
    ///     -- Операції з улюбленими NFT
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : BaseController
    {
        private readonly IPinService _pinService;
        private readonly INFTService _nftService;

        public FavoritesController(IPinService pinService, INFTService nftService)
        {
            _pinService = pinService;
            _nftService = nftService;
        }

        /// <summary>
        /// Отримує збережені користувачем піни.
        /// </summary>
        /// <param name="username">Нікнейм користувача.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Розмір сторінки (за замовчуванням 20).</param>
        /// <returns></returns>
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
