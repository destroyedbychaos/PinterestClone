using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.Web3AuthService
{
    public interface IWeb3AuthService
    {
        Task<ServiceResponse<NonceResponseDto>> GetNonceAsync(string walletAddress);
        Task<ServiceResponse<Web3AuthResponseDto>> VerifySignatureAsync(VerifySignatureRequestDto request);
        Task<ServiceResponse<Web3UserProfileDto>> GetUserByWalletAddressAsync(string walletAddress);
    }
} 