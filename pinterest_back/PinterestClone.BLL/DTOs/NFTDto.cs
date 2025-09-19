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
        public string CreatorWalletAddress { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Currency { get; set; }
        public bool IsForSale { get; set; }
        public bool IsMinted { get; set; }
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

    public class MintNFTRequestDto
    {
        public int? TokenId { get; set; }
        public string? TransactionHash { get; set; }
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
        public string FormattedBalance { get; set; } = string.Empty;
    }

    public class GasEstimateDto
    {
        public string OperationType { get; set; } = string.Empty;
        public string? ContractAddress { get; set; }
        public string? TokenId { get; set; }
        public string? ToAddress { get; set; }
        public decimal? Amount { get; set; }
        public decimal EstimatedGas { get; set; }
        public decimal GasPrice { get; set; }
        public decimal TotalCost { get; set; }
        public string Currency { get; set; } = "MATIC";
    }

    public class TransactionInfoDto
    {
        public string TransactionHash { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TokenAddress { get; set; }
        public string BlockNumber { get; set; } = string.Empty;
        public string GasUsed { get; set; } = string.Empty;
        public string GasPrice { get; set; } = string.Empty;
        public decimal TransactionFee { get; set; }
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime Timestamp { get; set; }
        public int Confirmations { get; set; }
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