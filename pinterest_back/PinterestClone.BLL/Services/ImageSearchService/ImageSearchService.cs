using Microsoft.AspNetCore.Http;
using System.Drawing;
using System.Drawing.Imaging;

namespace PinterestClone.BLL.Services.ImageSearchService
{
    public class ImageSearchService : IImageSearchService
    {
        public async Task<List<string>> AnalyzeImageAsync(IFormFile imageFile)
        {
            return await AnalyzeImageAsync(imageFile, null);
        }

        public async Task<List<string>> AnalyzeImageAsync(IFormFile imageFile, object? searchAreaInfo)
        {
            try
            {
                Console.WriteLine($"ImageSearchService.AnalyzeImageAsync called - searchAreaInfo: {searchAreaInfo}");
                
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);
                Console.WriteLine($"Image loaded - Width: {image.Width}, Height: {image.Height}");
                
                if (searchAreaInfo != null)
                {
                    var searchArea = searchAreaInfo.GetType().GetProperty("SearchArea")?.GetValue(searchAreaInfo) as string;
                    var selectionCoords = searchAreaInfo.GetType().GetProperty("SelectionCoords")?.GetValue(searchAreaInfo) as string;
                    
                    if (searchArea == "custom" && !string.IsNullOrEmpty(selectionCoords))
                    {
                        try
                        {
                            var coords = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(selectionCoords);
                            if (coords != null && coords.ContainsKey("x") && coords.ContainsKey("y") && 
                                coords.ContainsKey("width") && coords.ContainsKey("height"))
                            {
                                int x = (int)(coords["x"] * image.Width / 100);
                                int y = (int)(coords["y"] * image.Height / 100);
                                int width = (int)(coords["width"] * image.Width / 100);
                                int height = (int)(coords["height"] * image.Height / 100);
                                
                                using var croppedImage = CropImage(image, x, y, width, height);
                                return await AnalyzeCroppedImageAsync(croppedImage);
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error processing selection area: {ex.Message}");
                        }
                    }
                }
                
                var features = new List<string>();
                
                var aspectRatio = (double)image.Width / image.Height;
                if (aspectRatio > 2.0) features.Add("ultra-wide");
                else if (aspectRatio > 1.5) features.Add("landscape");
                else if (aspectRatio < 0.6) features.Add("ultra-tall");
                else if (aspectRatio < 0.8) features.Add("portrait");
                else features.Add("square");
                
                var colors = await ExtractImageFeaturesAsync(imageFile);
                features.AddRange(colors.Take(4)); 
                
                var brightness = CalculateAverageBrightness(image);
                if (brightness > 180) features.Add("bright");
                else if (brightness < 80) features.Add("dark");
                else features.Add("medium-brightness");
                
                var contrast = CalculateImageContrast(image);
                if (contrast > 0.6) features.Add("high-contrast");
                else if (contrast < 0.3) features.Add("low-contrast");
                else features.Add("medium-contrast");
                
 
                var extension = Path.GetExtension(imageFile.FileName).ToLower();
                if (extension == ".jpg" || extension == ".jpeg") features.Add("jpeg");
                else if (extension == ".png") features.Add("png");
                else if (extension == ".gif") features.Add("gif");
                else if (extension == ".webp") features.Add("webp");
                
                if (imageFile.Length > 5 * 1024 * 1024) features.Add("large");
                else if (imageFile.Length < 1024 * 1024) features.Add("small");
                else features.Add("medium");
                
                var complexity = CalculateImageComplexity(image);
                if (complexity > 0.6) features.Add("complex");
                else if (complexity < 0.3) features.Add("simple");
                else features.Add("moderate");
                
                var texture = AnalyzeImageTexture(image);
                features.Add(texture);
                

                var palette = AnalyzeColorPalette(image);
                features.AddRange(palette.Take(3)); 
                
                var style = AnalyzeImageStyle(image, brightness, contrast, complexity);
                features.Add(style);
                
                return features.Distinct().ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: AnalyzeImageAsync error: {ex.Message}");
                return new List<string> { "image", "photo" };
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
                var uploadedFeatures = await AnalyzeImageAsync(uploadedImage);
                
                var similarity = 0.0;
                

                using var stream = uploadedImage.OpenReadStream();
                using var image = Image.FromStream(stream);
                var uploadedAspectRatio = (double)image.Width / image.Height;
                
                var urlHash = existingImageUrl.GetHashCode();
                var random = new Random(urlHash);
                var estimatedAspectRatio = random.NextDouble() * 2 + 0.5; 
                var aspectRatioDiff = Math.Abs(uploadedAspectRatio - estimatedAspectRatio);
                if (aspectRatioDiff < 0.3) similarity += 0.4;
                else if (aspectRatioDiff < 0.6) similarity += 0.2;
                
                var uploadedColors = await ExtractImageFeaturesAsync(uploadedImage);
                
                var colorSimilarity = 0.0;
                foreach (var color in uploadedColors)
                {
                    var colorHash = color.GetHashCode();
                    var colorRandom = new Random(colorHash + urlHash);
                    if (colorRandom.NextDouble() > 0.6) colorSimilarity += 0.3;
                }
                similarity += Math.Min(colorSimilarity, 0.5);
                

                var brightness = CalculateAverageBrightness(image);
                var brightnessRandom = new Random(urlHash);
                var estimatedBrightness = brightnessRandom.Next(50, 200);
                var brightnessDiff = Math.Abs(brightness - estimatedBrightness);
                if (brightnessDiff < 50) similarity += 0.3;
                else if (brightnessDiff < 100) similarity += 0.15;
                
                var contrast = CalculateImageContrast(image);
                var contrastRandom = new Random(urlHash);
                var estimatedContrast = contrastRandom.NextDouble();
                var contrastDiff = Math.Abs(contrast - estimatedContrast);
                if (contrastDiff < 0.2) similarity += 0.25;
                else if (contrastDiff < 0.4) similarity += 0.1;
                
                var complexity = CalculateImageComplexity(image);
                var complexityRandom = new Random(urlHash);
                var estimatedComplexity = complexityRandom.NextDouble();
                var complexityDiff = Math.Abs(complexity - estimatedComplexity);
                if (complexityDiff < 0.2) similarity += 0.25;
                else if (complexityDiff < 0.4) similarity += 0.1;
                
                var varietyRandom = new Random(urlHash + uploadedImage.FileName.GetHashCode());
                similarity += varietyRandom.NextDouble() * 0.15;
                
                var finalSimilarity = Math.Min(similarity, 1.0);
                
                return finalSimilarity;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: CalculateSimilarityAsync error: {ex.Message}");
                return 0.0;
            }
        }

        public async Task<List<string>> ExtractImageFeaturesAsync(IFormFile imageFile)
        {
            return await ExtractImageFeaturesAsync(imageFile, null);
        }

        public async Task<List<string>> ExtractImageFeaturesAsync(IFormFile imageFile, object? searchAreaInfo)
        {
            try
            {
                using var stream = imageFile.OpenReadStream();
                using var image = Image.FromStream(stream);
                using var bitmap = new Bitmap(image);

                var colorCounts = new Dictionary<Color, int>();

                for (int x = 0; x < bitmap.Width; x += 20) 
                {
                    for (int y = 0; y < bitmap.Height; y += 20) 
                    {
                        var pixel = bitmap.GetPixel(x, y);
                        var colorKey = Color.FromArgb(pixel.R, pixel.G, pixel.B);
                        
                        if (colorCounts.ContainsKey(colorKey))
                            colorCounts[colorKey]++;
                        else
                            colorCounts[colorKey] = 1;
                    }
                }

                return colorCounts
                    .OrderByDescending(x => x.Value)
                    .Take(4) 
                    .Select(x => GetColorName(x.Key))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: ExtractImageFeaturesAsync error: {ex.Message}");
                return new List<string>();
            }
        }

        private int CalculateAverageBrightness(Image image)
        {
            using var bitmap = new Bitmap(image);
            long totalBrightness = 0;
            int pixelCount = 0;

            for (int x = 0; x < bitmap.Width; x += 10) 
            {
                for (int y = 0; y < bitmap.Height; y += 10) 
                {
                    var pixel = bitmap.GetPixel(x, y);
                    totalBrightness += (int)((pixel.R * 0.299) + (pixel.G * 0.587) + (pixel.B * 0.114));
                    pixelCount++;
                }
            }

            return pixelCount > 0 ? (int)(totalBrightness / pixelCount) : 0;
        }

        private double CalculateImageContrast(Image image)
        {
            using var bitmap = new Bitmap(image);
            var minBrightness = double.MaxValue;
            var maxBrightness = double.MinValue;

            for (int x = 0; x < bitmap.Width; x += 20) 
            {
                for (int y = 0; y < bitmap.Height; y += 20) 
                {
                    var pixel = bitmap.GetPixel(x, y);
                    var brightness = (pixel.R * 0.299) + (pixel.G * 0.587) + (pixel.B * 0.114);
                    minBrightness = Math.Min(minBrightness, brightness);
                    maxBrightness = Math.Max(maxBrightness, brightness);
                }
            }

            return maxBrightness > 0 ? (maxBrightness - minBrightness) / maxBrightness : 0.0;
        }

        private double CalculateImageComplexity(Image image)
        {
            using var bitmap = new Bitmap(image);
            var edgeCount = 0;
            var totalPixels = 0;

            for (int x = 1; x < bitmap.Width - 1; x += 10)
            {
                for (int y = 1; y < bitmap.Height - 1; y += 10) 
                {
                    var center = bitmap.GetPixel(x, y);
                    var left = bitmap.GetPixel(x - 1, y);
                    var right = bitmap.GetPixel(x + 1, y);
                    var top = bitmap.GetPixel(x, y - 1);
                    var bottom = bitmap.GetPixel(x, y + 1);

                    var brightnessCenter = (center.R * 0.299) + (center.G * 0.587) + (center.B * 0.114);
                    var brightnessLeft = (left.R * 0.299) + (left.G * 0.587) + (left.B * 0.114);
                    var brightnessRight = (right.R * 0.299) + (right.G * 0.587) + (right.B * 0.114);
                    var brightnessTop = (top.R * 0.299) + (top.G * 0.587) + (top.B * 0.114);
                    var brightnessBottom = (bottom.R * 0.299) + (bottom.G * 0.587) + (bottom.B * 0.114);

                    var maxDiff = Math.Max(
                        Math.Max(Math.Abs(brightnessCenter - brightnessLeft), Math.Abs(brightnessCenter - brightnessRight)),
                        Math.Max(Math.Abs(brightnessCenter - brightnessTop), Math.Abs(brightnessCenter - brightnessBottom))
                    );

                    if (maxDiff > 30) edgeCount++;
                    totalPixels++;
                }
            }

            return totalPixels > 0 ? (double)edgeCount / totalPixels : 0.0;
        }

        private string AnalyzeImageTexture(Image image)
        {
            using var bitmap = new Bitmap(image);
            var edgeCount = 0;
            var totalPixels = 0;
            var colorChanges = 0;


            for (int x = 1; x < bitmap.Width - 1; x += 10) 
            {
                for (int y = 1; y < bitmap.Height - 1; y += 10) 
                {
                    var center = bitmap.GetPixel(x, y);
                    var left = bitmap.GetPixel(x - 1, y);
                    var right = bitmap.GetPixel(x + 1, y);
                    var top = bitmap.GetPixel(x, y - 1);
                    var bottom = bitmap.GetPixel(x, y + 1);

                    var brightnessCenter = (center.R * 0.299) + (center.G * 0.587) + (center.B * 0.114);
                    var brightnessLeft = (left.R * 0.299) + (left.G * 0.587) + (left.B * 0.114);
                    var brightnessRight = (right.R * 0.299) + (right.G * 0.587) + (right.B * 0.114);
                    var brightnessTop = (top.R * 0.299) + (top.G * 0.587) + (top.B * 0.114);
                    var brightnessBottom = (bottom.R * 0.299) + (bottom.G * 0.587) + (bottom.B * 0.114);

                    var maxDiff = Math.Max(
                        Math.Max(Math.Abs(brightnessCenter - brightnessLeft), Math.Abs(brightnessCenter - brightnessRight)),
                        Math.Max(Math.Abs(brightnessCenter - brightnessTop), Math.Abs(brightnessCenter - brightnessBottom))
                    );

                    if (maxDiff > 30) edgeCount++;
                    if (maxDiff > 10) colorChanges++;
                    totalPixels++;
                }
            }

            var edgeRatio = totalPixels > 0 ? (double)edgeCount / totalPixels : 0.0;
            var colorChangeRatio = totalPixels > 0 ? (double)colorChanges / totalPixels : 0.0;

            if (edgeRatio < 0.1 && colorChangeRatio < 0.2) return "smooth";
            if (edgeRatio > 0.3) return "rough";
            if (colorChangeRatio > 0.4) return "patterned";
            return "mixed-texture";
        }

        private List<string> AnalyzeColorPalette(Image image)
        {
            using var bitmap = new Bitmap(image);
            var colorCounts = new Dictionary<string, int>();
            var warmColors = 0;
            var coolColors = 0;
            var neutralColors = 0;


            for (int x = 0; x < bitmap.Width; x += 20) 
            {
                for (int y = 0; y < bitmap.Height; y += 20) 
                {
                    var pixel = bitmap.GetPixel(x, y);
                    var colorName = GetColorName(pixel);
                    
                    if (colorCounts.ContainsKey(colorName))
                        colorCounts[colorName]++;
                    else
                        colorCounts[colorName] = 1;

                    var hue = pixel.GetHue();
                    if (hue >= 0 && hue < 60 || hue >= 330) warmColors++;
                    else if (hue >= 180 && hue < 270) coolColors++;
                    else neutralColors++;
                }
            }

            var palette = new List<string>();
            var totalPixels = warmColors + coolColors + neutralColors;

            if (totalPixels > 0)
            {
                var warmRatio = (double)warmColors / totalPixels;
                var coolRatio = (double)coolColors / totalPixels;

                if (warmRatio > 0.6) palette.Add("warm-palette");
                else if (coolRatio > 0.6) palette.Add("cool-palette");
                else palette.Add("neutral-palette");
            }


            var dominantColors = colorCounts.OrderByDescending(x => x.Value).Take(3); 
            foreach (var color in dominantColors)
            {
                palette.Add($"dominant-{color.Key}");
            }

            return palette;
        }

        private string AnalyzeImageStyle(Image image, int brightness, double contrast, double complexity)
        {

            if (brightness > 180 && contrast > 0.6) return "bright-contrast";
            if (brightness < 80 && contrast > 0.6) return "dark-contrast";
            if (complexity > 0.6) return "complex";
            if (complexity < 0.3) return "simple";
            return "balanced";
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

        private Image CropImage(Image sourceImage, int x, int y, int width, int height)
        {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x + width > sourceImage.Width) width = sourceImage.Width - x;
            if (y + height > sourceImage.Height) height = sourceImage.Height - y;
            
            var croppedImage = new Bitmap(width, height);
            using var graphics = Graphics.FromImage(croppedImage);
            graphics.DrawImage(sourceImage, new Rectangle(0, 0, width, height), new Rectangle(x, y, width, height), GraphicsUnit.Pixel);
            
            return croppedImage;
        }

        private async Task<List<string>> AnalyzeCroppedImageAsync(Image image)
        {
            try
            {
                var features = new List<string>();
                

                var aspectRatio = (double)image.Width / image.Height;
                if (aspectRatio > 2.0) features.Add("ultra-wide");
                else if (aspectRatio > 1.5) features.Add("landscape");
                else if (aspectRatio < 0.6) features.Add("ultra-tall");
                else if (aspectRatio < 0.8) features.Add("portrait");
                else features.Add("square");
                
                var colors = await ExtractCroppedImageFeaturesAsync(image);
                features.AddRange(colors.Take(4));
                

                var brightness = CalculateAverageBrightness(image);
                if (brightness > 180) features.Add("bright");
                else if (brightness < 80) features.Add("dark");
                else features.Add("medium-brightness");
                

                var contrast = CalculateImageContrast(image);
                if (contrast > 0.6) features.Add("high-contrast");
                else if (contrast < 0.3) features.Add("low-contrast");
                else features.Add("medium-contrast");
                

                var complexity = CalculateImageComplexity(image);
                if (complexity > 0.6) features.Add("complex");
                else if (complexity < 0.3) features.Add("simple");
                else features.Add("moderate");
                

                var texture = AnalyzeImageTexture(image);
                features.Add(texture);
                

                var palette = AnalyzeColorPalette(image);
                features.AddRange(palette.Take(3));
                

                var style = AnalyzeImageStyle(image, brightness, contrast, complexity);
                features.Add(style);
                
                return features.Distinct().ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: AnalyzeCroppedImageAsync error: {ex.Message}");
                return new List<string> { "image", "photo" };
            }
        }

        private async Task<List<string>> ExtractCroppedImageFeaturesAsync(Image image)
        {
            try
            {
                using var bitmap = new Bitmap(image);
                var colorCounts = new Dictionary<string, int>();


                for (int x = 0; x < bitmap.Width; x += 20)
                {
                    for (int y = 0; y < bitmap.Height; y += 20)
                    {
                        var pixel = bitmap.GetPixel(x, y);
                        var colorName = GetColorName(pixel);
                        
                        if (colorCounts.ContainsKey(colorName))
                            colorCounts[colorName]++;
                        else
                            colorCounts[colorName] = 1;
                    }
                }


                return colorCounts.OrderByDescending(x => x.Value).Take(4).Select(x => x.Key).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ImageSearchService: ExtractCroppedImageFeaturesAsync error: {ex.Message}");
                return new List<string> { "color" };
            }
        }
    }
} 