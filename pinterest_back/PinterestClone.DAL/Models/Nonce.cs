using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.Models
{
    public class Nonce
    {
        [Key]
        public string WalletAddress { get; set; } = string.Empty;
        
        public string NonceValue { get; set; } = string.Empty;
        
        public string Message { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 