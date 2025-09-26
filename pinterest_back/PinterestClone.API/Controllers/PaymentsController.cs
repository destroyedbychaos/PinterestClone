using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.BlockchainService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за керування платіжними операціями та взаємодію з блокчейном.
    /// --------------------------------------------------------------------------------------
    /// Методи:
    ///     -- Оцінка вартості газу для операції
    ///     -- Підтвердження транзакції
    ///     -- Обробка webhook з блокчейну
    ///     -- Отримання інформації про транзакцію
    ///     -- Отримання балансу (MATIC або токенів)
    ///     -- Виконання трансферу токенів
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : BaseController
    {
        private readonly IBlockchainService _blockchainService;

        public PaymentsController(IBlockchainService blockchainService)
        {
            _blockchainService = blockchainService;
        }

        /// <summary>
        /// Оцінює вартість газу для операції.
        /// </summary>
        /// <param name="operationType">Тип операції (mint, transfer, тощо).</param>
        /// <param name="contractAddress">Адреса смарт-контракту.</param>
        /// <param name="tokenId">ID токена.</param>
        /// <param name="toAddress">Адреса отримувача.</param>
        /// <param name="amount">Сума для операції.</param>
        /// <returns><see cref="IActionResult"/> з оцінкою газу.</returns>
        [HttpGet("gas-estimate")]
        [Authorize]
        public async Task<IActionResult> GetGasEstimate([FromQuery] string operationType, [FromQuery] string? contractAddress = null, [FromQuery] string? tokenId = null, [FromQuery] string? toAddress = null, [FromQuery] decimal? amount = null)
        {
            try
            {
                var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(walletAddress))
                {
                    return Unauthorized();
                }

                var response = await _blockchainService.EstimateGasForOperationAsync(operationType, walletAddress, contractAddress, tokenId, toAddress, amount);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error estimating gas: {ex.Message}" });
            }
        }

        /// <summary>
        /// Підтверджує транзакцію за її хешем.
        /// </summary>
        /// <param name="confirmDto">Модель з хешем транзакції.</param>
        /// <returns><see cref="IActionResult"/> з результатом підтвердження транзакції.</returns>
        [HttpPost("confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmTransaction([FromBody] ConfirmTransactionDto confirmDto)
        {
            try
            {
                var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(walletAddress))
                {
                    return Unauthorized();
                }

                var response = await _blockchainService.ConfirmTransactionAsync(confirmDto.TransactionHash, walletAddress);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error confirming transaction: {ex.Message}" });
            }
        }

        /// <summary>
        /// Обробляє webhook події з блокчейну.
        /// </summary>
        /// <param name="webhookDto">Модель з даними події.</param>
        /// <returns><see cref="IActionResult"/> з результатом обробки webhook.</returns>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook([FromBody] WebhookDto webhookDto)
        {
            try
            {
                var response = await _blockchainService.ProcessWebhookAsync(webhookDto);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error processing webhook: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримує інформацію про транзакцію.
        /// </summary>
        /// <param name="hash">Хеш транзакції.</param>
        /// <returns><see cref="IActionResult"/> з деталями транзакції.</returns>
        [HttpGet("transaction/{hash}")]
        [Authorize]
        public async Task<IActionResult> GetTransactionInfo(string hash)
        {
            try
            {
                var response = await _blockchainService.GetTransactionInfoAsync(hash);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error getting transaction info: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримує баланс гаманця користувача.
        /// </summary>
        /// <param name="tokenAddress">Адреса токена (опціонально, якщо null – MATIC).</param>
        /// <returns><see cref="IActionResult"/> з балансом.</returns>
        [HttpGet("balance")]
        [Authorize]
        public async Task<IActionResult> GetBalance([FromQuery] string? tokenAddress = null)
        {
            try
            {
                var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(walletAddress))
                {
                    return Unauthorized();
                }

                var response = await _blockchainService.GetBalanceAsync(walletAddress, tokenAddress);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error getting balance: {ex.Message}" });
            }
        }

        /// <summary>
        /// Виконує трансфер токенів або MATIC.
        /// </summary>
        /// <param name="transferDto">Модель з даними для трансферу.</param>
        /// <returns><see cref="IActionResult"/> з результатом трансферу.</returns>
        [HttpPost("transfer")]
        [Authorize]
        public async Task<IActionResult> Transfer([FromBody] TransferDto transferDto)
        {
            try
            {
                var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(walletAddress))
                {
                    return Unauthorized();
                }

                var response = await _blockchainService.TransferAsync(walletAddress, transferDto.ToAddress, transferDto.Amount, transferDto.TokenAddress);
                return GetResult(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error transferring: {ex.Message}" });
            }
        }
    }
} 