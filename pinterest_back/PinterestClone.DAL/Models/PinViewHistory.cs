using PinterestClone.DAL.Models.Identity;
using System;

namespace PinterestClone.DAL.Models
{
    public class PinViewHistory
    {
        public required Guid Id { get; set; } = Guid.NewGuid();
        
        public required Guid PinId { get; set; }
        public virtual Pin Pin { get; set; } = null!;
        
        public required string UserId { get; set; }
        public virtual User User { get; set; } = null!;
        
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
        public string? Source { get; set; } 
        public int ViewDuration { get; set; } = 0; 
        public bool IsCompleteView { get; set; } = false; 
    }
}
