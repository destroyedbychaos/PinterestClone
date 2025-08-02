using System;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class HiddenPin
    {
        public int Id { get; set; }
        public Guid PinId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime HiddenAt { get; set; } = DateTime.UtcNow;


        public virtual Pin Pin { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
} 