using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.BlockchainService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : BaseController
    {
        private readonly IBlockchainService _blockchainService;

        public PaymentsController(IBlockchainService blockchainService)
        {
            _blockchainService = blockchainService;
        }

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