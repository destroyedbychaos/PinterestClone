using Microsoft.AspNetCore.Http;
using System.Drawing;
using System.Drawing.Imaging;

namespace PinterestClone.BLL.Services.ImageAnalysisService
{
    public class ImageAnalysisService : IImageAnalysisService
    {
        public async Task<string> GenerateImageHashAsync(IFormFile imageFile)
        {
            try
            {
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);
                using var resized = new Bitmap(image, new Size(8, 8));
                using var grayscale = new Bitmap(resized.Width, resized.Height);

                for (int x = 0; x < resized.Width; x++)
                {
                    for (int y = 0; y < resized.Height; y++)
                    {
                        var pixel = resized.GetPixel(x, y);
                        var gray = (int)((pixel.R * 0.299) + (pixel.G * 0.587) + (pixel.B * 0.114));
                        grayscale.SetPixel(x, y, Color.FromArgb(gray, gray, gray));
                    }
                }

                long totalBrightness = 0;
                for (int x = 0; x < grayscale.Width; x++)
                {
                    for (int y = 0; y < grayscale.Height; y++)
                    {
                        var pixel = grayscale.GetPixel(x, y);
                        totalBrightness += pixel.R;
                    }
                }
                var averageBrightness = totalBrightness / 64;

                var hash = "";
                for (int x = 0; x < grayscale.Width; x++)
                {
                    for (int y = 0; y < grayscale.Height; y++)
                    {
                        var pixel = grayscale.GetPixel(x, y);
                        hash += pixel.R > averageBrightness ? "1" : "0";
                    }
                }

                return hash;
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        public async Task<List<string>> ExtractImageTagsAsync(IFormFile imageFile)
        {
            Console.WriteLine($"ImageAnalysisService: ExtractImageTagsAsync called with file: {imageFile?.FileName}");
            try
            {
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);
                
                var tags = new List<string>();
            
                var colors = await GetImageColorsAsync(imageFile);
                foreach (var color in colors.Take(3))
                {
                    tags.Add(color);
                }

                var aspectRatio = (double)image.Width / image.Height;
                if (aspectRatio > 1.5) tags.Add("landscape");
                else if (aspectRatio < 0.7) tags.Add("portrait");
                else tags.Add("square");

                var brightness = CalculateAverageBrightness(image);
                if (brightness > 180) tags.Add("bright");
                else if (brightness < 80) tags.Add("dark");
                else tags.Add("medium");


                var extension = Path.GetExtension(imageFile.FileName).ToLower();
                if (extension == ".jpg" || extension == ".jpeg") tags.Add("jpeg");
                else if (extension == ".png") tags.Add("png");
                else if (extension == ".gif") tags.Add("gif");

                if (imageFile.Length > 5 * 1024 * 1024) tags.Add("large");
                else if (imageFile.Length < 1024 * 1024) tags.Add("small");
                else tags.Add("medium");

                var result = tags.Distinct().ToList();
                Console.WriteLine($"ImageAnalysisService: ExtractImageTagsAsync returning {result.Count} tags: {string.Join(", ", result)}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageAnalysisService: ExtractImageTagsAsync error: {ex.Message}");
                return new List<string>();
            }
        }

        public async Task<double> CalculateImageSimilarityAsync(string hash1, string hash2)
        {
            if (string.IsNullOrEmpty(hash1) || string.IsNullOrEmpty(hash2) || hash1.Length != hash2.Length)
                return 0.0;

            int differences = 0;
            for (int i = 0; i < hash1.Length; i++)
            {
                if (hash1[i] != hash2[i])
                    differences++;
            }

            return 1.0 - ((double)differences / hash1.Length);
        }

        public async Task<List<string>> GetImageColorsAsync(IFormFile imageFile)
        {
            Console.WriteLine($"ImageAnalysisService: GetImageColorsAsync called with file: {imageFile?.FileName}");
            try
            {
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);
                using var bitmap = new Bitmap(image);

                var colorCounts = new Dictionary<Color, int>();

                for (int x = 0; x < bitmap.Width; x += 10)
                {
                    for (int y = 0; y < bitmap.Height; y += 10)
                    {
                        var pixel = bitmap.GetPixel(x, y);
                        var colorKey = Color.FromArgb(pixel.R, pixel.G, pixel.B);
                        
                        if (colorCounts.ContainsKey(colorKey))
                            colorCounts[colorKey]++;
                        else
                            colorCounts[colorKey] = 1;
                    }
                }

                var result = colorCounts
                    .OrderByDescending(x => x.Value)
                    .Take(5)
                    .Select(x => GetColorName(x.Key))
                    .ToList();
                Console.WriteLine($"ImageAnalysisService: GetImageColorsAsync returning {result.Count} colors: {string.Join(", ", result)}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageAnalysisService: GetImageColorsAsync error: {ex.Message}");
                return new List<string>();
            }
        }

        public async Task<string> GetImageDominantColorAsync(IFormFile imageFile)
        {
            var colors = await GetImageColorsAsync(imageFile);
            return colors.FirstOrDefault() ?? "unknown";
        }

        public async Task<Dictionary<string, object>> AnalyzeImageContentAsync(IFormFile imageFile)
        {
            Console.WriteLine($"ImageAnalysisService: AnalyzeImageContentAsync called with file: {imageFile?.FileName}");
            try
            {
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);

                var analysis = new Dictionary<string, object>
                {
                    ["width"] = image.Width,
                    ["height"] = image.Height,
                    ["aspectRatio"] = (double)image.Width / image.Height,
                    ["fileSize"] = imageFile.Length,
                    ["format"] = image.RawFormat.ToString()
                };

                using var bitmap = new Bitmap(image);
                var brightnessValues = new List<int>();
                
                for (int x = 0; x < bitmap.Width; x += 5)
                {
                    for (int y = 0; y < bitmap.Height; y += 5)
                    {
                        var pixel = bitmap.GetPixel(x, y);
                        var brightness = (int)((pixel.R * 0.299) + (pixel.G * 0.587) + (pixel.B * 0.114));
                        brightnessValues.Add(brightness);
                    }
                }

                analysis["averageBrightness"] = brightnessValues.Average();
                analysis["brightnessStdDev"] = CalculateStandardDeviation(brightnessValues);

                var colorCounts = new Dictionary<Color, int>();
                for (int x = 0; x < bitmap.Width; x += 10)
                {
                    for (int y = 0; y < bitmap.Height; y += 10)
                    {
                        var pixel = bitmap.GetPixel(x, y);
                        var colorKey = Color.FromArgb(pixel.R, pixel.G, pixel.B);
                        
                        if (colorCounts.ContainsKey(colorKey))
                            colorCounts[colorKey]++;
                        else
                            colorCounts[colorKey] = 1;
                    }
                }

                analysis["colorVariance"] = CalculateColorVariance(colorCounts);
                analysis["dominantColors"] = colorCounts
                    .OrderByDescending(x => x.Value)
                    .Take(5)
                    .Select(x => GetColorName(x.Key))
                    .ToList();

                Console.WriteLine($"ImageAnalysisService: AnalyzeImageContentAsync returning analysis with {analysis.Count} properties");
                return analysis;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageAnalysisService: AnalyzeImageContentAsync error: {ex.Message}");
                return new Dictionary<string, object>();
            }
        }

        private int CalculateAverageBrightness(Image image)
        {
            using var bitmap = new Bitmap(image);
            long totalBrightness = 0;
            int pixelCount = 0;

            for (int x = 0; x < bitmap.Width; x += 5)
            {
                for (int y = 0; y < bitmap.Height; y += 5)
                {
                    var pixel = bitmap.GetPixel(x, y);
                    totalBrightness += (int)((pixel.R * 0.299) + (pixel.G * 0.587) + (pixel.B * 0.114));
                    pixelCount++;
                }
            }

            return pixelCount > 0 ? (int)(totalBrightness / pixelCount) : 0;
        }

        private string GetColorName(Color color)
        {
            var hue = color.GetHue();
            var saturation = color.GetSaturation();
            var brightness = color.GetBrightness();

            if (brightness < 0.2) return "black";
            if (brightness > 0.8) return "white";
            if (saturation < 0.1) return "gray";

            if (hue < 30 || hue >= 330) return "red";
            if (hue < 60) return "orange";
            if (hue < 90) return "yellow";
            if (hue < 150) return "green";
            if (hue < 210) return "cyan";
            if (hue < 270) return "blue";
            if (hue < 330) return "magenta";

            return "unknown";
        }

        private double CalculateStandardDeviation(List<int> values)
        {
            if (!values.Any()) return 0;
            
            var mean = values.Average();
            var variance = values.Select(x => Math.Pow(x - mean, 2)).Average();
            return Math.Sqrt(variance);
        }

        private double CalculateColorVariance(Dictionary<Color, int> colorCounts)
        {
            if (!colorCounts.Any()) return 0;
            
            var totalPixels = colorCounts.Values.Sum();
            var mean = (double)totalPixels / colorCounts.Count;
            var variance = colorCounts.Values.Select(x => Math.Pow(x - mean, 2)).Average();
            return Math.Sqrt(variance);
        }
    }
} 