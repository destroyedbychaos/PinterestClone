using System;
using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class UserBlock
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string BlockerId { get; set; } = null!;

        [Required]
        public string BlockedUserId { get; set; } = null!;

        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

        public string? Reason { get; set; }

        public virtual User Blocker { get; set; } = null!;
        public virtual User BlockedUser { get; set; } = null!;
    }
}
