using Microsoft.AspNetCore.Http;
using Emgu.CV;
using Emgu.CV.Structure;
using Emgu.CV.Features2D;
using Emgu.CV.Util;
using System.Drawing;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    public class ImageSearchService : IImageSearchService
    {
        private readonly string _imageStoragePath;
        
        public ImageSearchService()
        {
            _imageStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            

            if (!Directory.Exists(_imageStoragePath))
            {
                Console.WriteLine($"Warning: Image storage path does not exist: {_imageStoragePath}");
            }
        }

        public async Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, double similarityThreshold = 0.8)
        {
            return await FindSimilarImagesAsync(uploadedImage, null, similarityThreshold);
        }

        public async Task<List<string>> FindSimilarImagesAsync(IFormFile uploadedImage, object? searchAreaInfo, double similarityThreshold = 0.8)
        {
            try
            {
                var similarImages = new List<string>();
                

                var tempUploadPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + Path.GetExtension(uploadedImage.FileName));
                using (var stream = new FileStream(tempUploadPath, FileMode.Create))
                {
                    await uploadedImage.CopyToAsync(stream);
                }

                using var queryImage = new Mat(tempUploadPath, Emgu.CV.CvEnum.ImreadModes.Color);
                
                if (queryImage.IsEmpty)
                {
                    Console.WriteLine($"Error: Could not load uploaded image: {tempUploadPath}");
                    return new List<string>();
                }
                

                using var sift = new SIFT();
                

                using var queryKeyPoints = new VectorOfKeyPoint();
                using var queryDescriptors = new Mat();
                sift.DetectAndCompute(queryImage, null, queryKeyPoints, queryDescriptors, false);
                

                if (queryKeyPoints.Size == 0 || queryDescriptors.IsEmpty)
                {
                    Console.WriteLine($"Error: No keypoints found in uploaded image");
                    return new List<string>();
                }


                using var matcher = new BFMatcher(Emgu.CV.Features2D.DistanceType.L2, false);

                foreach (var imagePath in Directory.GetFiles(_imageStoragePath, "*.jpg").Concat(Directory.GetFiles(_imageStoragePath, "*.png")))
                {
                    try
                    {
                        using var currentImage = new Mat(imagePath, Emgu.CV.CvEnum.ImreadModes.Color);
                        
                        if (currentImage.IsEmpty)
                        {
                            Console.WriteLine($"Warning: Could not load image: {imagePath}");
                            continue;
                        }
                        
                        using var currentKeyPoints = new VectorOfKeyPoint();
                        using var currentDescriptors = new Mat();
                        
                        sift.DetectAndCompute(currentImage, null, currentKeyPoints, currentDescriptors, false);

                        if (currentKeyPoints.Size == 0 || currentDescriptors.IsEmpty)
                        {
                            Console.WriteLine($"Warning: No keypoints found in image: {imagePath}");
                            continue;
                        }

                        using var matches = new VectorOfDMatch();
                        matcher.Match(queryDescriptors, currentDescriptors, matches);
                        
                        var goodMatches = 0;
                        for (int i = 0; i < matches.Size; i++)
                        {
                            if (matches[i].Distance < similarityThreshold * 100)
                            {
                                goodMatches++;
                            }
                        }
                        var similarity = matches.Size > 0 ? (double)goodMatches / matches.Size : 0;

                        if (similarity > similarityThreshold)
                        {
                            similarImages.Add(imagePath);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing image {imagePath}: {ex.Message}");
                        continue;
                    }
                }

                if (File.Exists(tempUploadPath))
                {
                    File.Delete(tempUploadPath);
                }

                return similarImages;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: FindSimilarImagesAsync error: {ex.Message}");
                return new List<string>();
            }
        }

        public async Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl)
        {
            return await CalculateSimilarityAsync(uploadedImage, existingImageUrl, null);
        }

        public async Task<double> CalculateSimilarityAsync(IFormFile uploadedImage, string existingImageUrl, object? searchAreaInfo)
        {
            try
            {

                var tempUploadPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + Path.GetExtension(uploadedImage.FileName));
                using (var stream = new FileStream(tempUploadPath, FileMode.Create))
                {
                    await uploadedImage.CopyToAsync(stream);
                }


                var existingImagePath = Path.Combine(_imageStoragePath, Path.GetFileName(existingImageUrl));
                
                if (!File.Exists(existingImagePath))
                {
                    return 0.0;
                }


                using var queryImage = new Mat(tempUploadPath, Emgu.CV.CvEnum.ImreadModes.Color);
                using var existingImage = new Mat(existingImagePath, Emgu.CV.CvEnum.ImreadModes.Color);
                

                if (queryImage.IsEmpty)
                {
                    Console.WriteLine($"Error: Could not load uploaded image: {tempUploadPath}");
                    return 0.0;
                }
                
                if (existingImage.IsEmpty)
                {
                    Console.WriteLine($"Error: Could not load existing image: {existingImagePath}");
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
                    Console.WriteLine($"Error: No keypoints found in one or both images");
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


                if (File.Exists(tempUploadPath))
                {
                    File.Delete(tempUploadPath);
                }

                return similarity;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: CalculateSimilarityAsync error: {ex.Message}");
                return 0.0;
            }
        }
    }
} 