using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.BlockchainService
{
    public interface IBlockchainService
    {
        Task<NFTMintResponseDto> MintNFTAsync(string nftId, string walletAddress, string tokenUri);
        Task<NFTBurnResponseDto> BurnNFTAsync(string tokenId, string contractAddress, string walletAddress);
        Task<string> GetTokenURIAsync(string tokenId, string contractAddress);
        Task<string> GetOwnerAsync(string tokenId, string contractAddress);
        Task<bool> IsApprovedForAllAsync(string owner, string operatorAddress, string contractAddress);
        Task<string> ApproveAsync(string to, string tokenId, string contractAddress, string walletAddress);
        Task<string> TransferFromAsync(string from, string to, string tokenId, string contractAddress, string walletAddress);
        
        Task<decimal> GetMATICBalanceAsync(string walletAddress);
        Task<decimal> GetGasPriceAsync();
        Task<decimal> EstimateGasForMintAsync(string walletAddress, string tokenUri);
        Task<decimal> EstimateGasForBurnAsync(string tokenId);
        Task<bool> HasEnoughMATICForTransactionAsync(string walletAddress, decimal gasLimit, decimal gasPrice);
        Task<string> TransferMATICAsync(string from, string to, decimal amount);
        

        Task<bool> ValidateTransactionAsync(string transactionHash);
        Task<decimal> GetTransactionFeeAsync(string transactionHash);
        Task<string> GetTransactionStatusAsync(string transactionHash);
    }
} 