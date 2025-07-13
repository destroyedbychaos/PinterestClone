using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class ReportPinDto
    {
        [Required]
        public string PinId { get; set; } = string.Empty;

        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string ReportMessage { get; set; } = string.Empty;
    }
} 