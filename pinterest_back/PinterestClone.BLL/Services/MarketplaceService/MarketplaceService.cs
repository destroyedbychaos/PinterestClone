using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.BlockchainService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.MarketplaceRepository;
using PinterestClone.DAL.Repositories.NFTRepository;
using System.Numerics;

namespace PinterestClone.BLL.Services.MarketplaceService
{
    public class MarketplaceService : IMarketplaceService
    {
        private readonly IMarketplaceRepository _marketplaceRepository;
        private readonly INFTRepository _nftRepository;
        private readonly IBlockchainService _blockchainService;

        public MarketplaceService(
            IMarketplaceRepository marketplaceRepository,
            INFTRepository nftRepository,
            IBlockchainService blockchainService)
        {
            _marketplaceRepository = marketplaceRepository;
            _nftRepository = nftRepository;
            _blockchainService = blockchainService;
        }

        public async Task<ServiceResponse<MarketplaceListingDto>> ListNFTForSaleAsync(ListNFTDto listNFTDto, string sellerWalletAddress)
        {
            try
            {
                var nft = await _nftRepository.GetByIdAsync(listNFTDto.NFTId);
                if (nft == null)
                {
                    return ServiceResponse<MarketplaceListingDto>.NotFoundResponse("NFT not found");
                }

                if (nft.OwnerWalletAddress.ToLower() != sellerWalletAddress.ToLower())
                {
                    return ServiceResponse<MarketplaceListingDto>.UnauthorizedResponse("You can only list your own NFTs");
                }

                if (string.IsNullOrEmpty(nft.TokenId))
                {
                    return ServiceResponse<MarketplaceListingDto>.ErrorResponse("NFT must be minted before listing for sale");
                }

                var existingListing = await _marketplaceRepository.GetActiveByNFTIdAsync(listNFTDto.NFTId);
                if (existingListing != null)
                {
                    return ServiceResponse<MarketplaceListingDto>.ErrorResponse("NFT is already listed for sale");
                }

                var listing = new MarketplaceListing
                {
                    NFTId = listNFTDto.NFTId,
                    SellerWalletAddress = sellerWalletAddress,
                    Price = listNFTDto.Price,
                    Currency = listNFTDto.Currency
                };

                var createdListing = await _marketplaceRepository.CreateAsync(listing);
                return ServiceResponse<MarketplaceListingDto>.SuccessResponse(MapToMarketplaceListingDto(createdListing));
            }
            catch (Exception ex)
            {
                return ServiceResponse<MarketplaceListingDto>.ErrorResponse($"Error listing NFT for sale: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> RemoveFromSaleAsync(string nftId, string sellerWalletAddress)
        {
            try
            {
                var listing = await _marketplaceRepository.GetActiveByNFTIdAsync(nftId);
                if (listing == null)
                {
                    return ServiceResponse<bool>.NotFoundResponse("Active listing not found");
                }

                if (listing.SellerWalletAddress.ToLower() != sellerWalletAddress.ToLower())
                {
                    return ServiceResponse<bool>.UnauthorizedResponse("You can only remove your own listings");
                }

                var success = await _marketplaceRepository.DeactivateByNFTIdAsync(nftId);
                return ServiceResponse<bool>.SuccessResponse(success);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error removing NFT from sale: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<MarketplaceListingsResponseDto>> GetAllListingsAsync(int page, int pageSize)
        {
            try
            {
                var listings = await _marketplaceRepository.GetAllActiveAsync(page, pageSize);
                var totalCount = await _marketplaceRepository.GetActiveCountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var response = new MarketplaceListingsResponseDto
                {
                    Listings = listings.Select(MapToMarketplaceListingDto).ToList(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };

                return ServiceResponse<MarketplaceListingsResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<MarketplaceListingsResponseDto>.ErrorResponse($"Error getting listings: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<ListingStatusDto>> GetListingStatusAsync(string nftId)
        {
            try
            {
                var listing = await _marketplaceRepository.GetByNFTIdAsync(nftId);
                
                var status = new ListingStatusDto
                {
                    NFTId = nftId,
                    IsListed = listing?.IsActive ?? false,
                    Price = listing?.Price,
                    Currency = listing?.Currency,
                    SellerWalletAddress = listing?.SellerWalletAddress,
                    ListedAt = listing?.ListedAt,
                    IsSold = listing?.SoldAt.HasValue ?? false,
                    BuyerWalletAddress = listing?.BuyerWalletAddress,
                    SoldAt = listing?.SoldAt,
                    TransactionHash = listing?.TransactionHash
                };

                return ServiceResponse<ListingStatusDto>.SuccessResponse(status);
            }
            catch (Exception ex)
            {
                return ServiceResponse<ListingStatusDto>.ErrorResponse($"Error getting listing status: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<PurchaseTransactionDto>> InitiatePurchaseAsync(string nftId, PurchaseRequestDto purchaseRequest, string buyerWalletAddress)
        {
            try
            {
                var listing = await _marketplaceRepository.GetActiveByNFTIdAsync(nftId);
                if (listing == null)
                {
                    return ServiceResponse<PurchaseTransactionDto>.NotFoundResponse("Active listing not found");
                }

                if (listing.SellerWalletAddress.ToLower() == buyerWalletAddress.ToLower())
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("You cannot buy your own NFT");
                }

                if (purchaseRequest.OfferPrice < listing.Price)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("Offer price is lower than listing price");
                }

                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<PurchaseTransactionDto>.NotFoundResponse("NFT not found");
                }

                var gasPriceResponse = await _blockchainService.GetGasPriceAsync();
                if (!gasPriceResponse.IsSuccess)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("Failed to get gas price");
                }

                var estimatedGasResponse = await _blockchainService.EstimateGasForMintAsync(buyerWalletAddress);
                if (!estimatedGasResponse.IsSuccess)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("Failed to estimate gas");
                }

                var totalCost = listing.Price + (estimatedGasResponse.Data.EstimatedGas * gasPriceResponse.Data);

                var buyerBalanceResponse = await _blockchainService.GetMATICBalanceAsync(buyerWalletAddress);
                if (!buyerBalanceResponse.IsSuccess)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("Failed to get buyer balance");
                }

                if (buyerBalanceResponse.Data.Balance < totalCost)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse($"Insufficient MATIC balance. Required: {totalCost}, Available: {buyerBalanceResponse.Data.Balance}");
                }

                var transactionDataResponse = await _blockchainService.PreparePurchaseTransactionAsync(
                    nftId, 
                    buyerWalletAddress, 
                    listing.Price);

                if (!transactionDataResponse.IsSuccess)
                {
                    return ServiceResponse<PurchaseTransactionDto>.ErrorResponse("Failed to prepare transaction data");
                }

                var purchaseTransaction = new PurchaseTransactionDto
                {
                    NFTId = nftId,
                    TokenId = listing.NFT?.TokenId ?? string.Empty,
                    ContractAddress = listing.NFT?.ContractAddress ?? string.Empty,
                    SellerWalletAddress = listing.SellerWalletAddress,
                    BuyerWalletAddress = buyerWalletAddress,
                    Price = listing.Price,
                    Currency = listing.Currency,
                    TransactionData = transactionDataResponse.Data.TransactionData,
                    ToAddress = transactionDataResponse.Data.ToAddress,
                    Value = transactionDataResponse.Data.Value,
                    GasLimit = estimatedGasResponse.Data.EstimatedGas.ToString(),
                    GasPrice = gasPriceResponse.Data.ToString(),
                    Nonce = transactionDataResponse.Data.Nonce
                };

                return ServiceResponse<PurchaseTransactionDto>.SuccessResponse(purchaseTransaction);
            }
            catch (Exception ex)
            {
                return ServiceResponse<PurchaseTransactionDto>.ErrorResponse($"Error initiating purchase: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<PurchaseConfirmationDto>> ConfirmPurchaseAsync(ConfirmPurchaseDto confirmPurchaseDto, string buyerWalletAddress)
        {
            try
            {
                var listing = await _marketplaceRepository.GetActiveByNFTIdAsync(confirmPurchaseDto.NFTId);
                if (listing == null)
                {
                    return ServiceResponse<PurchaseConfirmationDto>.NotFoundResponse("Active listing not found");
                }

                if (listing.SellerWalletAddress.ToLower() == buyerWalletAddress.ToLower())
                {
                    return ServiceResponse<PurchaseConfirmationDto>.ErrorResponse("You cannot buy your own NFT");
                }

                var nft = await _nftRepository.GetByIdAsync(confirmPurchaseDto.NFTId);
                if (nft == null)
                {
                    return ServiceResponse<PurchaseConfirmationDto>.NotFoundResponse("NFT not found");
                }

                var transactionStatusResponse = await _blockchainService.ValidateTransactionAsync(confirmPurchaseDto.TransactionHash);
                if (!transactionStatusResponse.IsSuccess || !transactionStatusResponse.Data.IsSuccess)
                {
                    return ServiceResponse<PurchaseConfirmationDto>.ErrorResponse("Invalid transaction");
                }

                var success = await _marketplaceRepository.MarkAsSoldAsync(
                    confirmPurchaseDto.NFTId, 
                    buyerWalletAddress, 
                    confirmPurchaseDto.TransactionHash);

                if (!success)
                {
                    return ServiceResponse<PurchaseConfirmationDto>.ErrorResponse("Failed to mark NFT as sold");
                }

                var confirmation = new PurchaseConfirmationDto
                {
                    NFTId = confirmPurchaseDto.NFTId,
                    TokenId = listing.NFT?.TokenId ?? string.Empty,
                    ContractAddress = listing.NFT?.ContractAddress ?? string.Empty,
                    SellerWalletAddress = listing.SellerWalletAddress,
                    BuyerWalletAddress = buyerWalletAddress,
                    Price = listing.Price,
                    Currency = listing.Currency,
                    TransactionHash = confirmPurchaseDto.TransactionHash,
                    IsSuccess = true,
                    GasUsed = confirmPurchaseDto.GasUsed,
                    GasPrice = confirmPurchaseDto.GasPrice,
                    TransactionFee = confirmPurchaseDto.TransactionFee
                };

                return ServiceResponse<PurchaseConfirmationDto>.SuccessResponse(confirmation);
            }
            catch (Exception ex)
            {
                return ServiceResponse<PurchaseConfirmationDto>.ErrorResponse($"Error confirming purchase: {ex.Message}");
            }
        }

        private MarketplaceListingDto MapToMarketplaceListingDto(MarketplaceListing listing)
        {
            return new MarketplaceListingDto
            {
                Id = listing.Id,
                NFTId = listing.NFTId,
                NFTName = listing.NFT?.Name ?? string.Empty,
                NFTDescription = listing.NFT?.Description ?? string.Empty,
                NFTImageUrl = listing.NFT?.ImageUrl ?? string.Empty,
                TokenId = listing.NFT?.TokenId ?? string.Empty,
                ContractAddress = listing.NFT?.ContractAddress ?? string.Empty,
                SellerWalletAddress = listing.SellerWalletAddress,
                Price = listing.Price,
                Currency = listing.Currency,
                IsActive = listing.IsActive,
                ListedAt = listing.ListedAt,
                SoldAt = listing.SoldAt,
                BuyerWalletAddress = listing.BuyerWalletAddress,
                TransactionHash = listing.TransactionHash
            };
        }
    }
} 