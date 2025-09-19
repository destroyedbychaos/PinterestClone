namespace PinterestClone.BLL.DTOs
{
    public class ListNFTDto
    {
        public string NFTId { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
    }

    public class MarketplaceListingDto
    {
        public string Id { get; set; } = string.Empty;
        public string NFTId { get; set; } = string.Empty;
        public string NFTName { get; set; } = string.Empty;
        public string NFTDescription { get; set; } = string.Empty;
        public string NFTImageUrl { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string SellerWalletAddress { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
        public bool IsActive { get; set; }
        public DateTime ListedAt { get; set; }
        public DateTime? SoldAt { get; set; }
        public string? BuyerWalletAddress { get; set; }
        public string? TransactionHash { get; set; }
    }

    public class MarketplaceListingsResponseDto
    {
        public List<MarketplaceListingDto> Listings { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ListingStatusDto
    {
        public string NFTId { get; set; } = string.Empty;
        public bool IsListed { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public string? SellerWalletAddress { get; set; }
        public DateTime? ListedAt { get; set; }
        public bool IsSold { get; set; }
        public string? BuyerWalletAddress { get; set; }
        public DateTime? SoldAt { get; set; }
        public string? TransactionHash { get; set; }
    }

    public class PurchaseRequestDto
    {
        public decimal OfferPrice { get; set; }
        public string Currency { get; set; } = "MATIC";
    }

    public class PurchaseTransactionDto
    {
        public string NFTId { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string SellerWalletAddress { get; set; } = string.Empty;
        public string BuyerWalletAddress { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
        public string TransactionData { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string GasLimit { get; set; } = string.Empty;
        public string GasPrice { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }

    public class ConfirmPurchaseDto
    {
        public string NFTId { get; set; } = string.Empty;
        public string TransactionHash { get; set; } = string.Empty;
        public decimal GasUsed { get; set; }
        public decimal GasPrice { get; set; }
        public decimal TransactionFee { get; set; }
    }

    public class PurchaseConfirmationDto
    {
        public string NFTId { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string SellerWalletAddress { get; set; } = string.Empty;
        public string BuyerWalletAddress { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
        public string TransactionHash { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public decimal GasUsed { get; set; }
        public decimal GasPrice { get; set; }
        public decimal TransactionFee { get; set; }
    }
} 