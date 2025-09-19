using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.BlockchainService
{
    public interface IBlockchainService
    {
        Task<ServiceResponse<NFTMintResponseDto>> MintNFTAsync(string nftId, string walletAddress);
        Task<ServiceResponse<NFTBurnResponseDto>> BurnNFTAsync(string nftId, string walletAddress);
        Task<ServiceResponse<string>> GetTokenURIAsync(string tokenId, string contractAddress);
        Task<ServiceResponse<string>> GetOwnerAsync(string tokenId, string contractAddress);
        Task<ServiceResponse<bool>> IsApprovedForAllAsync(string owner, string operatorAddress, string contractAddress);
        Task<ServiceResponse<string>> ApproveAsync(string to, string tokenId, string contractAddress, string walletAddress);
        Task<ServiceResponse<string>> TransferFromAsync(string from, string to, string tokenId, string contractAddress, string walletAddress);
        


        Task<ServiceResponse<MATICBalanceDto>> GetMATICBalanceAsync(string walletAddress);
        Task<ServiceResponse<decimal>> GetGasPriceAsync();
        Task<ServiceResponse<GasEstimateDto>> EstimateGasForMintAsync(string walletAddress);
        Task<ServiceResponse<GasEstimateDto>> EstimateGasForBurnAsync(string tokenId);
        Task<ServiceResponse<bool>> HasEnoughMATICForTransactionAsync(string walletAddress, decimal gasEstimate);
        Task<ServiceResponse<TransactionInfoDto>> TransferMATICAsync(string fromAddress, string toAddress, decimal amount);
        



        Task<ServiceResponse<TransactionInfoDto>> ValidateTransactionAsync(string transactionHash);
        Task<ServiceResponse<TransactionInfoDto>> GetTransactionFeeAsync(string transactionHash);
        Task<ServiceResponse<TransactionInfoDto>> GetTransactionStatusAsync(string transactionHash);
        


        Task<ServiceResponse<TransactionDataDto>> PreparePurchaseTransactionAsync(string nftId, string buyerAddress, decimal price);
        



        Task<ServiceResponse<GasEstimateDto>> EstimateGasForOperationAsync(string operationType, string walletAddress, string? contractAddress = null, string? tokenId = null, string? toAddress = null, decimal? amount = null);
        Task<ServiceResponse<PaymentResponseDto>> ConfirmTransactionAsync(string transactionHash, string walletAddress);
        Task<ServiceResponse<PaymentResponseDto>> ProcessWebhookAsync(WebhookDto webhookDto);
        Task<ServiceResponse<TransactionInfoDto>> GetTransactionInfoAsync(string hash);
        Task<ServiceResponse<BalanceDto>> GetBalanceAsync(string walletAddress, string? tokenAddress = null);
        Task<ServiceResponse<PaymentResponseDto>> TransferAsync(string fromAddress, string toAddress, decimal amount, string? tokenAddress = null);
    }
} 