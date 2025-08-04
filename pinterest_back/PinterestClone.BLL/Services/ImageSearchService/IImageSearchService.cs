using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    public interface IImageSearchService
    {
        Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, double similarityThreshold = 0.8);
        Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, object? searchAreaInfo, double similarityThreshold = 0.8);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl, object? searchAreaInfo);
    }
} 