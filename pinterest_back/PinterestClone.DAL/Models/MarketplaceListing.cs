using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.Models
{
    public class MarketplaceListing
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        public string NFTId { get; set; } = string.Empty;
        
        [Required]
        public string SellerWalletAddress { get; set; } = string.Empty;
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public string Currency { get; set; } = "MATIC";
        
        public bool IsActive { get; set; } = true;
        
        public DateTime ListedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? SoldAt { get; set; }
        
        public string? BuyerWalletAddress { get; set; }
        
        public string? TransactionHash { get; set; }
        

        public virtual NFT NFT { get; set; } = null!;
    }
} 