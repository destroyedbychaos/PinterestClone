using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.ImageAnalysisService
{
    public interface IImageAnalysisService
    {
        Task<string> GenerateImageHashAsync(IFormFile imageFile);
        Task<List<string>> ExtractImageTagsAsync(IFormFile imageFile);
        Task<double> CalculateImageSimilarityAsync(string hash1, string hash2);
        Task<List<string>> GetImageColorsAsync(IFormFile imageFile);
        Task<string> GetImageDominantColorAsync(IFormFile imageFile);
        Task<Dictionary<string, object>> AnalyzeImageContentAsync(IFormFile imageFile);
    }
} 