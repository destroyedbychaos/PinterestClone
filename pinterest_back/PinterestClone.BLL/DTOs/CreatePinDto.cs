using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для процесу створення пінів.
    /// </summary>
    public class CreatePinDto
    {
        /// <summary>
        /// Назва піна.
        /// </summary>
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Опис піна.
        /// </summary>
        [StringLength(1000)]
        public string? Description { get; set; }

       /// <summary>
       /// Картинка піна як файл.
       /// </summary>
        [Required]
        public IFormFile ImageFile { get; set; } = null!;

        /// <summary>
        /// Посилання на пін.
        /// </summary>
        [Url]
        public string? Link { get; set; }

        /// <summary>
        /// Теги піна.
        /// </summary>
        public string? Tags { get; set; }

        /// <summary>
        /// Посилання на картинку.
        /// </summary>
        public string? ImageUrl { get; set; }
    }
} 