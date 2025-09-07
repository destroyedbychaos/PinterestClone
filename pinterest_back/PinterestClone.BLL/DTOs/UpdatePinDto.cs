using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для оновлення піна.
    /// </summary>
    public class UpdatePinDto
    {
        /// <summary>
        /// Назва піна.
        /// </summary>
        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Опис піна.
        /// </summary>
        [StringLength(1000)]
        public string? Description { get; set; }

        /// <summary>
        /// Посилання на пін.
        /// </summary>
        [Url]
        public string? Link { get; set; }

        /// <summary>
        /// Теги піна.
        /// </summary>
        public string? Tags { get; set; }
    }
} 