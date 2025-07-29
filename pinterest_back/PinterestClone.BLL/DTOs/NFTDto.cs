namespace PinterestClone.BLL.DTOs
{
    public class NFTDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string ChainId { get; set; } = string.Empty;
        public string OwnerWalletAddress { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Currency { get; set; }
        public bool IsForSale { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateNFTDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
        public bool IsForSale { get; set; }
        public string? IPFSMetadata { get; set; }
        public string? IPFSImageHash { get; set; }

    }

    public class UpdateNFTDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "MATIC";
        public bool IsForSale { get; set; }
    }

    public class NFTListDto
    {
        public List<NFTDto> NFTs { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class UserNFTsResponseDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public NFTListDto NFTs { get; set; } = new();
    }

    public class UserFavoritesResponseDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public NFTListDto Favorites { get; set; } = new();
    }

    public class NFTMintResponseDto
    {
        public string NFTId { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string TransactionHash { get; set; } = string.Empty;
        public string IPFSMetadataHash { get; set; } = string.Empty;
        public string IPFSImageHash { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public decimal? GasUsed { get; set; }
        public decimal? GasPrice { get; set; }
        public decimal? TransactionFee { get; set; }
    }

    public class NFTBurnResponseDto
    {
        public string NFTId { get; set; } = string.Empty;
        public string TokenId { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string TransactionHash { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public decimal? GasUsed { get; set; }
        public decimal? GasPrice { get; set; }
        public decimal? TransactionFee { get; set; }
    }


    public class MATICBalanceDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Currency { get; set; } = "MATIC";
    }

    public class GasEstimateDto
    {
        public decimal GasLimit { get; set; }
        public decimal GasPrice { get; set; }
        public decimal EstimatedFee { get; set; }
        public string Currency { get; set; } = "MATIC";
    }

    public class TransactionInfoDto
    {
        public string TransactionHash { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal GasUsed { get; set; }
        public decimal GasPrice { get; set; }
        public decimal TransactionFee { get; set; }
        public string Currency { get; set; } = "MATIC";
        public DateTime? Timestamp { get; set; }
    }

    public class MATICTransferDto
    {
        public string FromAddress { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransactionHash { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
    }
} 