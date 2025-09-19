using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.MarketplaceService
{
    public interface IMarketplaceService
    {
        Task<ServiceResponse<MarketplaceListingDto>> ListNFTForSaleAsync(ListNFTDto listNFTDto, string sellerWalletAddress);
        Task<ServiceResponse<bool>> RemoveFromSaleAsync(string nftId, string sellerWalletAddress);
        Task<ServiceResponse<MarketplaceListingsResponseDto>> GetAllListingsAsync(int page, int pageSize);
        Task<ServiceResponse<ListingStatusDto>> GetListingStatusAsync(string nftId);
        Task<ServiceResponse<PurchaseTransactionDto>> InitiatePurchaseAsync(string nftId, PurchaseRequestDto purchaseRequest, string buyerWalletAddress);
        Task<ServiceResponse<PurchaseConfirmationDto>> ConfirmPurchaseAsync(ConfirmPurchaseDto confirmPurchaseDto, string buyerWalletAddress);
    }
} 