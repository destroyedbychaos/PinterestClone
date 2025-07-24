using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.DTOs
{
    public class CreatePinDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

       
        [Required]
        public IFormFile ImageFile { get; set; } = null!;

        [Url]
        public string? Link { get; set; }

        public string? Tags { get; set; }

        public string? ImageUrl { get; set; }
    }

    
    public class FindSimilarImagesDto
    {
        [Required]
        public IFormFile ImageFile { get; set; } = null!;
    }
} 