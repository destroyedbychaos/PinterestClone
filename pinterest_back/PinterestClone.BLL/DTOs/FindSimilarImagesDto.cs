using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.DTOs
{
    public class FindSimilarImagesDto
    {
        public IFormFile? ImageFile { get; set; }
        public string? SearchArea { get; set; } 
        public string? SelectionCoords { get; set; } 
    }
} 