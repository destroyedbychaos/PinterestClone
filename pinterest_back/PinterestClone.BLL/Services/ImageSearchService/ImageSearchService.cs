using Microsoft.AspNetCore.Http;
using Emgu.CV;
using Emgu.CV.Structure;
using Emgu.CV.Features2D;
using Emgu.CV.Util;
using System.Drawing;
using System.Security.Cryptography;
using System.Text;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    /// <summary>
    /// Сервіс відповідальний за пошук картинок.
    /// ----------------------------------------
    /// Методи:
    ///     -- Знайти подібні картинки за вибраною картинкою
    ///     -- Знайти подібні картинки за вибраною пошуковим ключем та картинкою
    ///     -- Порахувати подібність картинок
    ///     -- Порахувати подібність картинок враховуючи пошуковий ключ
    /// </summary>
    public class ImageSearchService : IImageSearchService
    {
        private readonly HttpClient _httpClient;
        
        public ImageSearchService()
        {
            _httpClient = new HttpClient();
        }

        /// <summary>
        /// Знаходить подібні картинки до завантаженого зображення.
        /// </summary>
        /// <param name="uploadedImage">Завантажене зображення (<see cref="IFormFile"/>).</param>
        /// <param name="similarityThreshold">Поріг подібності (0.0–1.0).</param>
        /// <returns>Список посилань на подібні зображенея.</returns>
        public async Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, double similarityThreshold = 0.8)
        {
            return await FindSimilarImagesAsync(uploadedImage, null, similarityThreshold);
        }

        /// <summary>
        /// Знаходить подібні картинки до завантаженого зображення з урахуванням додаткової області пошуку.
        /// </summary>
        /// <param name="uploadedImage">Завантажене зображення.</param>
        /// <param name="searchAreaInfo">Додаткова інформація про область пошуку (може бути <c>null</c>).</param>
        /// <param name="similarityThreshold">Поріг подібності (0.0–1.0).</param>
        /// <returns>Список шляхів до подібних зображень.</returns>
        public async Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, object? searchAreaInfo, double similarityThreshold = 0.8)
        {
            try
            {
                Console.WriteLine("FindSimilarImagesAsync: This method now works with online images from PinService");
                return new List<string>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: FindSimilarImagesAsync error: {ex.Message}");
                return new List<string>();
            }
        }


        public async Task<string> CalculateImageHashAsync(IFormFile imageFile)
        {
            try
            {

                using var stream = imageFile.OpenReadStream();
                using var md5 = MD5.Create();
                var hashBytes = await md5.ComputeHashAsync(stream);
                return Convert.ToHexString(hashBytes).ToLower();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calculating hash for uploaded image: {ex.Message}");
                return string.Empty;
            }
        }


        public async Task<string> CalculateImageHashFromPathAsync(string imagePath)
        {
            if (!File.Exists(imagePath))
            {
                Console.WriteLine($"File not found: {imagePath}");
                return string.Empty;
            }

            try
            {

                using var stream = File.OpenRead(imagePath);
                using var md5 = MD5.Create();
                var hashBytes = await md5.ComputeHashAsync(stream);
                return Convert.ToHexString(hashBytes).ToLower();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calculating hash for {imagePath}: {ex.Message}");
                return string.Empty;
            }
        }


        public async Task<string> CalculateImageHashFromBytesAsync(byte[] imageBytes)
        {
            try
            {
                using var md5 = MD5.Create();
                var hashBytes = await md5.ComputeHashAsync(new MemoryStream(imageBytes));
                return Convert.ToHexString(hashBytes).ToLower();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CalculateImageHashFromBytesAsync error: {ex.Message}");
                return string.Empty;
            }
        }


        public async Task<List<string>> FindExactImageCopiesAsync(IFormFile imageFile)
        {
            try
            {
                Console.WriteLine($"FindExactImageCopiesAsync: Starting search for {imageFile.FileName}");
                var queryHash = await CalculateImageHashAsync(imageFile);
                
                if (string.IsNullOrEmpty(queryHash))
                {
                    Console.WriteLine("FindExactImageCopiesAsync: Failed to calculate query hash");
                    return new List<string>();
                }
                
                Console.WriteLine($"FindExactImageCopiesAsync: Query hash = {queryHash}");

                Console.WriteLine("FindExactImageCopiesAsync: This method now works with online images from PinService");
                return new List<string>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FindExactImageCopiesAsync: {ex.Message}");
                return new List<string>();
            }
        }


        public async Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl)
        {
            return await CalculateSimilarityAsync(uploadedImage, existingImageUrl, null);
        }


        public async Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl, object? searchAreaInfo)
        {
            var tempUploadPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + Path.GetExtension(uploadedImage.FileName));
            var tempExistingPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".jpg");
            
            try
            {
                using (var stream = new FileStream(tempUploadPath, FileMode.Create))
                {
                    await uploadedImage.CopyToAsync(stream);
                }

                using var httpClient = new HttpClient();
                using var response = await httpClient.GetAsync(existingImageUrl);
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"CalculateSimilarityAsync: Could not download image from {existingImageUrl}");
                    return 0.0;
                }

                using (var stream = await response.Content.ReadAsStreamAsync())
                using (var fileStream = new FileStream(tempExistingPath, FileMode.Create))
                {
                    await stream.CopyToAsync(fileStream);
                }

                using var queryImage = new Mat(tempUploadPath, Emgu.CV.CvEnum.ImreadModes.Color);
                using var existingImage = new Mat(tempExistingPath, Emgu.CV.CvEnum.ImreadModes.Color);
                
                if (queryImage.IsEmpty)
                {
                    Console.WriteLine($"CalculateSimilarityAsync: Could not load uploaded image: {Path.GetFileName(tempUploadPath)}");
                    return 0.0;
                }
                
                if (existingImage.IsEmpty)
                {
                    Console.WriteLine($"CalculateSimilarityAsync: Could not load existing image: {Path.GetFileName(tempExistingPath)}");
                    return 0.0;
                }
                
                using var sift = new SIFT();
                
                using var queryKeyPoints = new VectorOfKeyPoint();
                using var queryDescriptors = new Mat();
                using var existingKeyPoints = new VectorOfKeyPoint();
                using var existingDescriptors = new Mat();
                
                sift.DetectAndCompute(queryImage, null, queryKeyPoints, queryDescriptors, false);
                sift.DetectAndCompute(existingImage, null, existingKeyPoints, existingDescriptors, false);
                
                if (queryKeyPoints.Size == 0 || queryDescriptors.IsEmpty || existingKeyPoints.Size == 0 || existingDescriptors.IsEmpty)
                {
                    Console.WriteLine($"CalculateSimilarityAsync: No keypoints found in images");
                    return 0.0;
                }

                using var matcher = new BFMatcher(Emgu.CV.Features2D.DistanceType.L2, false);
                using var matches = new VectorOfDMatch();
                matcher.Match(queryDescriptors, existingDescriptors, matches);
                
                var goodMatches = 0;
                for (int i = 0; i < matches.Size; i++)
                {
                    if (matches[i].Distance < 80)
                    {
                        goodMatches++;
                    }
                }
                
                var similarity = matches.Size > 0 ? (double)goodMatches / matches.Size : 0;
                Console.WriteLine($"CalculateSimilarityAsync: Similarity with {existingImageUrl}: {similarity:F3}");
                return similarity;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CalculateSimilarityAsync: Error processing {existingImageUrl}: {ex.Message}");
                return 0.0;
            }
            finally
            {
                if (File.Exists(tempUploadPath))
                {
                    File.Delete(tempUploadPath);
                }
                if (File.Exists(tempExistingPath))
                {
                    File.Delete(tempExistingPath);
                }
            }
        }
    }
} 