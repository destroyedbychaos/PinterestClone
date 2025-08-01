using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    public interface IImageSearchService
    {
        Task<List<string>> AnalyzeImageAsync(IFormFile imageFile);
        Task<List<string>> AnalyzeImageAsync(IFormFile imageFile, object searchAreaInfo);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl);
        Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl, object searchAreaInfo);
        Task<List<string>> ExtractImageFeaturesAsync(IFormFile imageFile);
        Task<List<string>> ExtractImageFeaturesAsync(IFormFile imageFile, object searchAreaInfo);
    }
} 