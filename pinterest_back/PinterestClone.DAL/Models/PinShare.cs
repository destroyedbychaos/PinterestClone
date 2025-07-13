using System;
using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class PinShare
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Guid PinId { get; set; }

        [Required]
        public string SharedByUserId { get; set; } = null!;

        [Required]
        public string SharedWithUserId { get; set; } = null!;

        public string? Message { get; set; }

        public DateTime SharedAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public virtual Pin Pin { get; set; } = null!;
        public virtual User SharedByUser { get; set; } = null!;
        public virtual User SharedWithUser { get; set; } = null!;
    }
}