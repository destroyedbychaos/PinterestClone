using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.NFTService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;
using PinterestClone.BLL.Services.ImageService;
using PinterestClone.BLL.Services.BlockchainService;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за керування NFT та взаємодію з блокчейном.
    /// --------------------------------------------------------------------
    /// Методи:
    ///     -- Створення NFT
    ///     -- Отримання всіх NFT
    ///     -- Отримання NFT за ідентифікатором
    ///     -- Оновлення NFT
    ///     -- Видалення NFT (з можливістю burn на блокчейні)
    ///     -- Мінтинг NFT
    ///     -- Спалювання NFT
    ///     -- Отримання балансу MATIC
    ///     -- Оцінка вартості газу для мінтингу
    ///     -- Оцінка вартості газу для спалювання
    ///     -- Трансфер MATIC
    ///     -- Отримання інформації про транзакцію
    ///     -- Отримання NFT поточного користувача
    ///     -- Отримання улюблених NFT поточного користувача
    ///     -- Додавання NFT в улюблені
    ///     -- Видалення NFT з улюблених
    ///     -- Отримання NFT конкретного користувача
    ///     -- Отримання улюблених NFT конкретного користувача
    /// </summary>
    [ApiController]
    [Route("api/nfts")]
    public class NFTController : BaseController
    {
        private readonly INFTService _nftService;
        private readonly IImageService _imageService;
        private readonly IBlockchainService _blockchainService;

        public NFTController(INFTService nftService, IImageService imageService, IBlockchainService blockchainService)
        {
            _nftService = nftService;
            _imageService = imageService;
            _blockchainService = blockchainService;
        }

        /// <summary>
        /// Створює новий NFT.
        /// </summary>
        /// <param name="createNFTDto">Модель з даними NFT.</param>
        /// <param name="imageFile">Файл зображення для NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом створення NFT.</returns>
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateNFT([FromForm] CreateNFTDto createNFTDto, IFormFile? imageFile)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            string imageUrl = string.Empty;
            if (imageFile != null)
            {
                try
                {
                    var (filePath, fileName, hash, size) = await _imageService.SaveImageAsync(imageFile);
                    imageUrl = _imageService.GetImageUrl(fileName);
                }
                catch (Exception ex)
                {
                    return BadRequest($"Error uploading image: {ex.Message}");
                }
            }
            else
            {
                return BadRequest("Image file is required");
            }

            var nftData = new CreateNFTDto
            {
                Name = createNFTDto.Name,
                Description = createNFTDto.Description,
                Price = createNFTDto.Price,
                Currency = createNFTDto.Currency,
                IsForSale = createNFTDto.IsForSale,
                IPFSMetadata = createNFTDto.IPFSMetadata,
                IPFSImageHash = createNFTDto.IPFSImageHash
            };

            var response = await _nftService.CreateNFTAsync(nftData, walletAddress, imageUrl);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує список всіх NFT.
        /// </summary>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком NFT.</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllNFTs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetAllNFTsAsync(page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує NFT за ідентифікатором.
        /// </summary>
        /// <param name="id">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> з деталями NFT.</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNFTById(string id)
        {
            var response = await _nftService.GetNFTByIdAsync(id);
            return GetResult(response);
        }

        /// <summary>
        /// Оновлює NFT.
        /// </summary>
        /// <param name="id">ID NFT.</param>
        /// <param name="updateNFTDto">Модель з оновленими даними NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом оновлення NFT.</returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateNFT(string id, [FromBody] UpdateNFTDto updateNFTDto)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.UpdateNFTAsync(id, updateNFTDto, walletAddress, null);
            return GetResult(response);
        }

        /// <summary>
        /// Видаляє NFT.
        /// </summary>
        /// <param name="id">ID NFT.</param>
        /// <param name="burnOnChain">Чи потрібно спалити NFT на блокчейні.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення NFT.</returns>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNFT(string id, [FromQuery] bool burnOnChain = false)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.DeleteNFTAsync(id, walletAddress, burnOnChain);
            return GetResult(response);
        }

        /// <summary>
        /// Мінтинг NFT.
        /// </summary>
        /// <param name="id">ІD NFT.</param>
        /// <param name="mintRequest">Модель з даними про мінтинг.</param>
        /// <returns><see cref="IActionResult"/> з результатом мінтингу NFT.</returns>
        [HttpPost("{id}/mint")]
        [Authorize]
        public async Task<IActionResult> MintNFT(string id, [FromBody] MintNFTRequestDto? mintRequest = null)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            // Якщо frontend передає дані про мінтинг (tokenId, transactionHash), оновлюємо NFT
            if (mintRequest != null && !string.IsNullOrEmpty(mintRequest.TransactionHash) && mintRequest.TokenId.HasValue)
            {
                var response = await _nftService.UpdateMintedNFTAsync(id, walletAddress, mintRequest.TokenId.Value, mintRequest.TransactionHash);
                return GetResult(response);
            }
            else
            {
                // Інакше робимо мінтинг через backend (старий шлях)
                var response = await _nftService.MintNFTAsync(id, walletAddress);
                return GetResult(response);
            }
        }

        /// <summary>
        /// Спалює NFT.
        /// </summary>
        /// <param name="id">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом спалювання NFT.</returns>
        [HttpPost("{id}/burn")]
        [Authorize]
        public async Task<IActionResult> BurnNFT(string id)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _nftService.BurnNFTAsync(id, walletAddress);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує баланс MATIC для користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> з балансом MATIC та ціною газу.</returns>
        [HttpGet("matic/balance")]
        [Authorize]
        public async Task<IActionResult> GetMATICBalance()
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            try
            {
                var balanceResponse = await _blockchainService.GetMATICBalanceAsync(walletAddress);
                var gasPriceResponse = await _blockchainService.GetGasPriceAsync();
                
                if (!balanceResponse.IsSuccess || !gasPriceResponse.IsSuccess)
                {
                    return BadRequest(new { success = false, message = "Failed to get balance or gas price" });
                }
                
                var response = new MATICBalanceDto
                {
                    WalletAddress = walletAddress,
                    Balance = balanceResponse.Data.Balance,
                    Currency = "MATIC"
                };

                return Ok(new { success = true, data = response, gasPrice = gasPriceResponse.Data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Оцінює вартість газу для мінтингу NFT.
        /// </summary>
        /// <param name="tokenUri">URI метаданих токена (за замовчуванням ipfs://metadata).</param>
        /// <returns><see cref="IActionResult"/> з оцінкою вартості газу.</returns>
        [HttpGet("matic/gas-estimate/mint")]
        [Authorize]
        public async Task<IActionResult> EstimateGasForMint([FromQuery] string tokenUri = "ipfs://metadata")
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            try
            {
                var gasEstimateResponse = await _blockchainService.EstimateGasForMintAsync(walletAddress);
                var gasPriceResponse = await _blockchainService.GetGasPriceAsync();
                
                if (!gasEstimateResponse.IsSuccess || !gasPriceResponse.IsSuccess)
                {
                    return BadRequest(new { success = false, message = "Failed to estimate gas" });
                }
                
                var estimatedFee = gasEstimateResponse.Data.EstimatedGas * gasPriceResponse.Data;

                var response = new GasEstimateDto
                {
                    EstimatedGas = gasEstimateResponse.Data.EstimatedGas,
                    GasPrice = gasPriceResponse.Data,
                    TotalCost = estimatedFee,
                    Currency = "MATIC"
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Оцінює вартість газу для спалювання NFT.
        /// </summary>
        /// <param name="tokenId">ID токена.</param>
        /// <returns><see cref="IActionResult"/> з оцінкою вартості газу.</returns>
        [HttpGet("matic/gas-estimate/burn")]
        [Authorize]
        public async Task<IActionResult> EstimateGasForBurn([FromQuery] string tokenId)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            try
            {
                var gasEstimateResponse = await _blockchainService.EstimateGasForBurnAsync(tokenId);
                var gasPriceResponse = await _blockchainService.GetGasPriceAsync();
                
                if (!gasEstimateResponse.IsSuccess || !gasPriceResponse.IsSuccess)
                {
                    return BadRequest(new { success = false, message = "Failed to estimate gas" });
                }
                
                var estimatedFee = gasEstimateResponse.Data.EstimatedGas * gasPriceResponse.Data;

                var response = new GasEstimateDto
                {
                    EstimatedGas = gasEstimateResponse.Data.EstimatedGas,
                    GasPrice = gasPriceResponse.Data,
                    TotalCost = estimatedFee,
                    Currency = "MATIC"
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Переміщає MATIC між гаманцями.
        /// </summary>
        /// <param name="transferDto">Модель з даними для трансферу.</param>
        /// <returns><see cref="IActionResult"/> з результатом трансферу.</returns>
        [HttpPost("matic/transfer")]
        [Authorize]
        public async Task<IActionResult> TransferMATIC([FromBody] MATICTransferDto transferDto)
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            if (walletAddress.ToLower() != transferDto.FromAddress.ToLower())
            {
                return Unauthorized("You can only transfer from your own wallet");
            }

            try
            {
                var transferResponse = await _blockchainService.TransferMATICAsync(
                    transferDto.FromAddress, 
                    transferDto.ToAddress, 
                    transferDto.Amount
                );

                if (!transferResponse.IsSuccess)
                {
                    return BadRequest(new { success = false, message = transferResponse.Message });
                }

                transferDto.TransactionHash = transferResponse.Data.TransactionHash;
                transferDto.IsSuccess = true;

                return Ok(new { success = true, data = transferDto });
            }
            catch (Exception ex)
            {
                transferDto.IsSuccess = false;
                transferDto.ErrorMessage = ex.Message;
                return BadRequest(new { success = false, data = transferDto });
            }
        }

        /// <summary>
        /// Отримує інформацію про транзакцію.
        /// </summary>
        /// <param name="transactionHash">Хеш транзакції.</param>
        /// <returns><see cref="IActionResult"/> з інформацією про транзакцію.</returns>
        [HttpGet("matic/transaction/{transactionHash}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTransactionInfo(string transactionHash)
        {
            try
            {
                var statusResponse = await _blockchainService.GetTransactionStatusAsync(transactionHash);
                var feeResponse = await _blockchainService.GetTransactionFeeAsync(transactionHash);
                var isValidResponse = await _blockchainService.ValidateTransactionAsync(transactionHash);

                if (!statusResponse.IsSuccess || !feeResponse.IsSuccess || !isValidResponse.IsSuccess)
                {
                    return BadRequest(new { success = false, message = "Failed to get transaction info" });
                }

                var response = new TransactionInfoDto
                {
                    TransactionHash = transactionHash,
                    IsSuccess = statusResponse.Data.IsSuccess,
                    TransactionFee = feeResponse.Data.TransactionFee,
                    Timestamp = DateTime.UtcNow
                };

                return Ok(new { success = true, data = response, isValid = isValidResponse.Data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Отримує NFT поточного користувача.
        /// </summary>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком NFT користувача.</returns>
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

        /// <summary>
        /// Отримує улюблені NFT поточного користувача.
        /// </summary>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком улюблених NFT.</returns>
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

        /// <summary>
        /// Додає NFT в улюблені.
        /// </summary>
        /// <param name="nftId">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом додавання в улюблені.</returns>
        [HttpPost("favorites/{nftId}")]
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
        /// Видаляє NFT з улюблених.
        /// </summary>
        /// <param name="nftId">ID NFT.</param>
        /// <returns><see cref="IActionResult"/> з результатом видалення з улюблених.</returns>
        [HttpDelete("favorites/{nftId}")]
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
        /// Отримує NFT конкретного користувача за його адресою гаманця.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком NFT користувача.</returns>
        [HttpGet("users/{walletAddress}/nfts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserNFTs(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserNFTsAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }

        /// <summary>
        /// Отримує улюблені NFT конкретного користувача за його адресою гаманця.
        /// </summary>
        /// <param name="walletAddress">Адреса гаманця користувача.</param>
        /// <param name="page">Номер сторінки.</param>
        /// <param name="pageSize">Кількість елементів на сторінку.</param>
        /// <returns><see cref="IActionResult"/> зі списком улюблених NFT користувача.</returns>
        [HttpGet("users/{walletAddress}/favorites")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(string walletAddress, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var response = await _nftService.GetUserFavoritesAsync(walletAddress, page, pageSize);
            return GetResult(response);
        }
    }
} 