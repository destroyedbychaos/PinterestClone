using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;

namespace PinterestClone.BLL.Services
{
    public interface IFileService
    {
        Task<(string filePath, string fileName, string hash, long size)> SaveImageAsync(IFormFile file);
        string GetImageUrl(string fileName);
        bool IsValidImage(IFormFile file);
        Task<string> CalculateFileHashAsync(IFormFile file);
    }

    public class FileService : IFileService
    {
        private readonly string _uploadsPath;
        private readonly string _baseUrl;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly long _maxFileSize = 10 * 1024 * 1024; 

        public FileService()
        {
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            _baseUrl = "/images"; 
            
           
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public bool IsValidImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > _maxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

           
            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        public async Task<(string filePath, string fileName, string hash, long size)> SaveImageAsync(IFormFile file)
        {
            if (!IsValidImage(file))
                throw new ArgumentException("Invalid image file");

           
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadsPath, fileName);

            
            var hash = await CalculateFileHashAsync(file);

            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return (filePath, fileName, hash, file.Length);
        }

        public string GetImageUrl(string fileName)
        {
            return $"{_baseUrl}/{fileName}";
        }

        public async Task<string> CalculateFileHashAsync(IFormFile file)
        {
            using var md5 = MD5.Create();
            using var stream = file.OpenReadStream();
            var hashBytes = await Task.Run(() => md5.ComputeHash(stream));
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }
    }
} 