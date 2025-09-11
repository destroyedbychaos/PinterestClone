using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;

namespace PinterestClone.BLL.Services.ImageService
{
    /// <summary>
    /// Сервіс для роботи з картинками для аватарки та банеру.
    /// ------------------------------------------------------
    /// Методи:
    ///     -- Перевірка валідності картинки
    ///     -- Зберегти картинку
    ///     -- Отримати посилання на картинку в базі
    ///     -- Створити хеш картинки
    ///     -- Видалити картинку
    /// </summary>
    public class ImageService : IImageService
    {
        private readonly string _uploadsPath;
        private readonly string _baseUrl;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly long _maxFileSize = 10 * 1024 * 1024;

        public ImageService()
        {
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            _baseUrl = "/images";


            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        /// <summary>
        /// Перевіряє, чи є файл валідним зображенням за розширенням, MIME-типом та розміром.
        /// </summary>
        /// <param name="file">Файл для перевірки.</param>
        /// <returns><c>True</c>, якщо файл валідний, інакше <c>False</c>.</returns>
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

        /// <summary>
        /// Зберігає файл зображення на диск та обчислює його хеш.
        /// </summary>
        /// <param name="file">Завантажене зображення.</param>
        /// <returns>Кортеж з шляхом до файлу, ім’ям файлу, хешем та розміром файлу.</returns>
        /// <exception cref="ArgumentException">Якщо файл не є валідним зображенням.</exception>
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

        /// <summary>
        /// Повертає URL картинки для використання в веб-додатку.
        /// </summary>
        /// <param name="fileName">Ім’я файлу картинки.</param>
        /// <returns>Повний URL картинки.</returns>
        public string GetImageUrl(string fileName)
        {
            return $"{_baseUrl}/{fileName}";
        }

        /// <summary>
        /// Обчислює MD5-хеш файлу.
        /// </summary>
        /// <param name="file">Файл для обчислення хешу.</param>
        /// <returns>Хеш файлу у вигляді рядка у шістнадцятковій системі.</returns>
        public async Task<string> CalculateFileHashAsync(IFormFile file)
        {
            using var md5 = MD5.Create();
            using var stream = file.OpenReadStream();
            var hashBytes = await Task.Run(() => md5.ComputeHash(stream));
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        /// <summary>
        /// Видаляє картинку з диску за URL або ім’ям файлу.
        /// </summary>
        /// <param name="imageUrlOrFileName">URL або ім’я файлу картинки.</param>
        /// <returns><c>True</c>, якщо файл успішно видалено, інакше <c>False</c>.</returns>
        public async Task<bool> DeleteImageAsync(string imageUrlOrFileName)
        {
            if (string.IsNullOrWhiteSpace(imageUrlOrFileName))
                return false;

            string fileName = imageUrlOrFileName;
            if (fileName.StartsWith("/api/images/"))
                fileName = fileName.Substring("/api/images/".Length);
            else if (fileName.StartsWith("/images/"))
                fileName = fileName.Substring("/images/".Length);
            fileName = fileName.Replace("\\", "/");
            if (fileName.Contains("/"))
                fileName = fileName.Substring(fileName.LastIndexOf('/') + 1);

            var filePath = Path.Combine(_uploadsPath, fileName);
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                    return true;
                }
                catch
                {
                    return false;
                }
            }
            return false;
        }
    }
}