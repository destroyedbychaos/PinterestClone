using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для поширення піна.
    /// </summary>
    public class SharePinDto
    {
        /// <summary>
        /// ID поширеного піна.
        /// </summary>
        [Required]
        public string PinId { get; set; } = string.Empty;

        /// <summary>
        /// ID користувача, з яким поширено пін.
        /// </summary>
        [Required]
        public string SharedWithUserId { get; set; } = string.Empty;

        /// <summary>
        /// Повідомлення з поширенням піна.
        /// </summary>
        [StringLength(500)]
        public string? Message { get; set; }
    }
}