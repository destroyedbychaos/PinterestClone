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
} 