using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.NFTService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : BaseController
    {
        private readonly INFTService _nftService;

        public FavoritesController(INFTService nftService)
        {
            _nftService = nftService;
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