using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.Web3AuthService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Web3AuthController : BaseController
    {
        private readonly IWeb3AuthService _web3AuthService;

        public Web3AuthController(IWeb3AuthService web3AuthService)
        {
            _web3AuthService = web3AuthService;
        }

        [HttpPost("nonce")]
        public async Task<IActionResult> GetNonce([FromBody] GetNonceRequest request)
        {
            if (string.IsNullOrEmpty(request.WalletAddress))
            {
                return BadRequest(new { error = "Wallet address is required" });
            }

            var response = await _web3AuthService.GetNonceAsync(request.WalletAddress);
            return GetResult(response);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifySignature([FromBody] VerifySignatureRequest request)
        {
            if (string.IsNullOrEmpty(request.WalletAddress) || 
                string.IsNullOrEmpty(request.Signature) || 
                string.IsNullOrEmpty(request.Nonce))
            {
                return BadRequest(new { error = "Wallet address, signature and nonce are required" });
            }

            var requestDto = new VerifySignatureRequestDto
            {
                WalletAddress = request.WalletAddress,
                Signature = request.Signature,
                Nonce = request.Nonce
            };
            var response = await _web3AuthService.VerifySignatureAsync(requestDto);
            return GetResult(response);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var walletAddress = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(walletAddress))
            {
                return Unauthorized();
            }

            var response = await _web3AuthService.GetUserByWalletAddressAsync(walletAddress);
            return GetResult(response);
        }
    }

    public class GetNonceRequest
    {
        public string WalletAddress { get; set; } = string.Empty;
    }

    public class VerifySignatureRequest
    {
        public string WalletAddress { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }
} 