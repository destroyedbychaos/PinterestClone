using System;
using System.ComponentModel.DataAnnotations;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class ProfileReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ProfileId { get; set; } = null!;

        [Required]
        public string ReportedByUserId { get; set; } = null!;

        [Required]
        [StringLength(1000)]
        public string ReportMessage { get; set; } = null!;

        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public bool IsResolved { get; set; } = false;

        public DateTime? ResolvedAt { get; set; }

        public string? ResolutionNotes { get; set; }

        public virtual User Profile { get; set; } = null!;
        public virtual User ReportedByUser { get; set; } = null!;
    }
}
