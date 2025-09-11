using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для скарги на пін.
    /// </summary>
    public class ReportPinDto
    {
        /// <summary>
        /// ID піна.
        /// </summary>
        [Required]
        public string PinId { get; set; } = string.Empty;

        /// <summary>
        /// Причина скарги.
        /// </summary>
        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string ReportMessage { get; set; } = string.Empty;
    }
} 