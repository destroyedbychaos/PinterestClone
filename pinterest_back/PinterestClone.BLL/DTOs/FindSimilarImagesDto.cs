using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для знайдення подібних до певного піна картинок.
    /// </summary>
    public class FindSimilarImagesDto
    {
        /// <summary>
        /// Картинка піна як файл.
        /// </summary>
        public IFormFile? ImageFile { get; set; }

        /// <summary>
        /// Відділ пошуку.
        /// </summary>
        public string? SearchArea { get; set; } 

        /// <summary>
        /// Координати вибору.
        /// </summary>
        public string? SelectionCoords { get; set; } 
    }
} 