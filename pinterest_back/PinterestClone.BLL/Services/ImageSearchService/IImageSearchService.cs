using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    public interface IImageSearchService
    {
        Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, double similarityThreshold = 0.8);
        Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, object? searchAreaInfo, double similarityThreshold = 0.8);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl, object? searchAreaInfo);
    Task<string> CalculateImageHashAsync(IFormFile imageFile);
    Task<string> CalculateImageHashFromPathAsync(string imagePath);
    Task<string> CalculateImageHashFromBytesAsync(byte[] imageBytes);
    Task<List<string>> FindExactImageCopiesAsync(IFormFile imageFile);
    }
} 