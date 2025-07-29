using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.Models
{
    public class NFT
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public string TokenId { get; set; } = string.Empty;

        public string ContractAddress { get; set; } = string.Empty;

        public string ChainId { get; set; } = string.Empty;

        public string OwnerWalletAddress { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string Currency { get; set; } = "MATIC";

        public bool IsForSale { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
    }
} 