using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.UserService;
using PinterestClone.BLL.Services.ImageService;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер для керування профілем користувача та його NFT.
    /// ---------------------------------------------
    /// Методи:
    ///     -- Отримання профілю користувача
    ///     -- Оновлення профілю користувача
    ///     -- Завантаження аватара
    ///     -- Завантаження баннера
    ///     -- Видалення аватара
    ///     -- Видалення баннера
    ///     -- Отримання NFT користувача
    ///     -- Отримання створених користувачем NFT
    ///     -- Отримання улюблених NFT користувача
    ///     -- Додавання NFT у фаворити
    ///     -- Видалення NFT з фаворитів
    /// </summary>
    [ApiController]
    [Route("api/users")]
    public class UsersNFTController : BaseController
    {
        private readonly IUserService _userService;
        private readonly IImageService _imageService;
        private readonly INFTService _nftService;

        public UsersNFTController(IUserService userService, IImageService imageService, INFTService nftService)
        {
            _userService = userService;
            _imageService = imageService;
            _nftService = nftService;
        }

        /// <summary>
        /// Отримує профіль користувача за адресою гаманця.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <returns><see cref="IActionResult"/> з профілем користувача.</returns>
        [HttpGet("{walletAddress}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserProfile(string walletAddress)
        {
            var response = await _userService.GetUserByWalletAddressAsync(walletAddress);
            return GetResult(response);
        }

        /// <summary>
        /// Оновлює профіль користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="request">Модель з новими даними профілю.</param>
        /// <returns><see cref="IActionResult"/> з результатом оновлення профілю.</returns>
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

        /// <summary>
        /// Завантажує аватар користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="file">Файл аватара для завантаження.</param>
        /// <returns><see cref="IActionResult"/> з результатом завантаження аватара.</returns>
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

        /// <summary>
        /// Завантажує баннер користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="file">Файл баннера для завантаження.</param>
        /// <returns><see cref="IActionResult"/> з результатом завантаження баннера.</returns>
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

        /// <summary>
        /// Видаляє аватар користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення аватара.</returns>
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

        /// <summary>
        /// Видаляє баннер користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення баннера.</returns>
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

        /// <summary>
        /// Отримує NFT користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="page">Номер сторінки пагінації.</param>
        /// <param name="pageSize">Кількість елементів на сторінці.</param>
        /// <returns><see cref="IActionResult"/> з NFT користувача.</returns>
        [HttpGet("{walletAddress}/nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує NFT, створені користувачем.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="page">Номер сторінки пагінації.</param>
        /// <param name="pageSize">Кількість елементів на сторінці.</param>
        /// <returns><see cref="IActionResult"/> з NFT, створеними користувачем.</returns>
        [HttpGet("{walletAddress}/created-nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserCreatedNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserCreatedNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує обрані NFT користувача.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="page">Номер сторінки пагінації.</param>
        /// <param name="pageSize">Кількість елементів на сторінці.</param>
        /// <returns><see cref="IActionResult"/> з обраними NFT користувача.</returns>
        [HttpGet("{walletAddress}/favorites")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserFavoritesAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Додає NFT користувача до обраних.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="nftId">ID NFT для додавання.</param>
        /// <returns><see cref="IActionResult"/> з результатом додавання до обраних.</returns>
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

        /// <summary>
        /// Видаляє NFT користувача з обраних.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="nftId">ID NFT для видалення.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення з обраних.</returns>
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