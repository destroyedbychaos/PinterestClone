using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.ImageService
{
    public interface IImageService
    {
        Task<(string filePath, string fileName, string hash, long size)> SaveImageAsync(IFormFile file);
        string GetImageUrl(string fileName);
        bool IsValidImage(IFormFile file);
        Task<string> CalculateFileHashAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string imageUrlOrFileName);
    }
}
