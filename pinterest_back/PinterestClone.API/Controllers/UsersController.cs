using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.UserService;
using PinterestClone.BLL.Services.ImageService;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : BaseController
    {
        private readonly IUserService _userService;
        private readonly IImageService _imageService;
        private readonly INFTService _nftService;

        public UsersController(IUserService userService, IImageService imageService, INFTService nftService)
        {
            _userService = userService;
            _imageService = imageService;
            _nftService = nftService;
        }

        [HttpGet("{walletAddress}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserProfile(string walletAddress)
        {
            var response = await _userService.GetUserByWalletAddressAsync(walletAddress);
            return GetResult(response);
        }

        [HttpPut("{walletAddress}")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile(string walletAddress, [FromBody] UpdateUserProfileRequest request)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            var requestDto = new PinterestClone.BLL.Services.UserService.UpdateUserProfileRequest
            {
                Nickname = request.Nickname,
                Bio = request.Bio,
                AvatarUrl = request.AvatarUrl,
                BannerUrl = request.BannerUrl,
                Website = request.Website,
                Twitter = request.Twitter,
                Instagram = request.Instagram,
                Discord = request.Discord
            };
            var response = await _userService.UpdateUserProfileAsync(walletAddress, requestDto);
            return GetResult(response);
        }

        [HttpPost("{walletAddress}/avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(string walletAddress, IFormFile file)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "Файл не був завантажений" });
            }

            if (!_imageService.IsValidImage(file))
            {
                return BadRequest(new { error = "Неправильний формат файлу або розмір занадто великий" });
            }

            try
            {
                var (filePath, fileName, hash, size) = await _imageService.SaveImageAsync(file);
                var imageUrl = _imageService.GetImageUrl(fileName);

                var updateRequest = new PinterestClone.BLL.Services.UserService.UpdateUserProfileRequest
                {
                    AvatarUrl = imageUrl
                };
                var response = await _userService.UpdateUserProfileAsync(walletAddress, updateRequest);

                if (!response.IsSuccess)
                {
                    await _imageService.DeleteImageAsync(fileName);
                    return BadRequest(new { error = "Не вдалося оновити профіль" });
                }

                return Ok(new { 
                    message = "Аватар успішно завантажено",
                    avatarUrl = imageUrl,
                    fileName = fileName
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Помилка завантаження: {ex.Message}" });
            }
        }

        [HttpPost("{walletAddress}/banner")]
        [Authorize]
        public async Task<IActionResult> UploadBanner(string walletAddress, IFormFile file)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "Файл не був завантажений" });
            }

            if (!_imageService.IsValidImage(file))
            {
                return BadRequest(new { error = "Неправильний формат файлу або розмір занадто великий" });
            }

            try
            {
                var (filePath, fileName, hash, size) = await _imageService.SaveImageAsync(file);
                var imageUrl = _imageService.GetImageUrl(fileName);

                var updateRequest = new PinterestClone.BLL.Services.UserService.UpdateUserProfileRequest
                {
                    BannerUrl = imageUrl
                };
                var response = await _userService.UpdateUserProfileAsync(walletAddress, updateRequest);

                return Ok(new { 
                    message = "Баннер успішно завантажено",
                    bannerUrl = imageUrl,
                    fileName = fileName
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Помилка завантаження: {ex.Message}" });
            }
        }

        [HttpDelete("{walletAddress}/avatar")]
        [Authorize]
        public async Task<IActionResult> DeleteAvatar(string walletAddress)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            try
            {

                var userResponse = await _userService.GetUserByWalletAddressAsync(walletAddress);
                if (!userResponse.IsSuccess)
                {
                    return NotFound(new { error = "Користувача не знайдено" });
                }

                var currentAvatarUrl = userResponse.Data?.AvatarUrl;
                if (string.IsNullOrEmpty(currentAvatarUrl))
                {
                    return BadRequest(new { error = "Аватар не встановлено" });
                }

                await _imageService.DeleteImageAsync(currentAvatarUrl);
                var updateRequest = new PinterestClone.BLL.Services.UserService.UpdateUserProfileRequest
                {
                    AvatarUrl = null
                };
                var response = await _userService.UpdateUserProfileAsync(walletAddress, updateRequest);

                return Ok(new { message = "Аватар успішно видалено" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Помилка видалення: {ex.Message}" });
            }
        }

        [HttpDelete("{walletAddress}/banner")]
        [Authorize]
        public async Task<IActionResult> DeleteBanner(string walletAddress)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            try
            {

                var userResponse = await _userService.GetUserByWalletAddressAsync(walletAddress);
                var currentBannerUrl = userResponse.Data?.BannerUrl;
                if (string.IsNullOrEmpty(currentBannerUrl))
                {
                    return BadRequest(new { error = "Баннер не встановлено" });
                }

                await _imageService.DeleteImageAsync(currentBannerUrl);

                var updateRequest = new PinterestClone.BLL.Services.UserService.UpdateUserProfileRequest
                {
                    BannerUrl = null
                };
                var response = await _userService.UpdateUserProfileAsync(walletAddress, updateRequest);

                return Ok(new { message = "Баннер успішно видалено" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Помилка видалення: {ex.Message}" });
            }
        }

        [HttpGet("{walletAddress}/nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        [HttpGet("{walletAddress}/created-nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserCreatedNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserCreatedNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        [HttpGet("{walletAddress}/favorites")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserFavoritesAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        [HttpPost("{walletAddress}/favorites/{nftId}")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(string walletAddress, string nftId)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            var response = await _nftService.AddToFavoritesAsync(nftId, walletAddress);
            return GetResult(response);
        }

        [HttpDelete("{walletAddress}/favorites/{nftId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(string walletAddress, string nftId)
        {
            var currentWalletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentWalletAddress != walletAddress)
            {
                return Forbid();
            }

            var response = await _nftService.RemoveFromFavoritesAsync(nftId, walletAddress);
            return GetResult(response);
        }

    }

    public class UpdateUserProfileRequest
    {
        public string? Nickname { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public string? Discord { get; set; }
    }
} 