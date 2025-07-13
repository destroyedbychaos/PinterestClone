using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class SharePinDto
    {
        [Required]
        public string PinId { get; set; } = string.Empty;

        [Required]
        public string SharedWithUserId { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Message { get; set; }
    }
}