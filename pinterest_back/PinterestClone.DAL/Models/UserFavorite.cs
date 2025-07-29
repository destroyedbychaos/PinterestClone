using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.Models
{
    public class UserFavorite
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        public string UserWalletAddress { get; set; } = string.Empty;

        public string NFTId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual NFT NFT { get; set; } = null!;
    }
} 