using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NFTController : BaseController
    {
        private readonly INFTService _nftService;

        public NFTController(INFTService nftService)
        {
            _nftService = nftService;
        }

        [HttpGet("my-nfts")]
        [Authorize]
        public async Task<IActionResult> GetMyNFTs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.GetUserNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        [HttpGet("my-favorites")]
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

        [HttpPost("favorites/{nftId}")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.AddToFavoritesAsync(walletAddress, nftId);
            return GetResult(response);
        }

        [HttpDelete("favorites/{nftId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(string nftId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.RemoveFromFavoritesAsync(walletAddress, nftId);
            return GetResult(response);
        }

        [HttpGet("users/{walletAddress}/nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        [HttpGet("users/{walletAddress}/favorites")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserFavoritesAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }
    }
} 