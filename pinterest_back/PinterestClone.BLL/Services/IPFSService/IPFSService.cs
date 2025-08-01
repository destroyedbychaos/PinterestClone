using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace PinterestClone.BLL.Services.IPFSService
{
    public class IPFSService : IIPFSService
    {
        private readonly HttpClient _httpClient;
        private readonly string _ipfsApiUrl;
        private readonly string _ipfsGatewayUrl;
        private readonly string _apiKey;
        private readonly string _apiSecret;

        public IPFSService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _ipfsApiUrl = configuration["IPFS:ApiUrl"] ?? "https://api.pinata.cloud";
            _ipfsGatewayUrl = configuration["IPFS:GatewayUrl"] ?? "https://gateway.pinata.cloud/ipfs";
            _apiKey = configuration["IPFS:ApiKey"] ?? "";
            _apiSecret = configuration["IPFS:ApiSecret"] ?? "";

            // Налаштування HTTP клієнта для Pinata
            if (!string.IsNullOrEmpty(_apiKey) && !string.IsNullOrEmpty(_apiSecret))
            {
                _httpClient.DefaultRequestHeaders.Add("pinata_api_key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("pinata_secret_api_key", _apiSecret);
            }
        }

        public async Task<ServiceResponse<string>> UploadImageAsync(IFormFile file)
        {
            try
            {
                using var content = new MultipartFormDataContent();
                using var fileStream = file.OpenReadStream();
                using var streamContent = new StreamContent(fileStream);
                
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                content.Add(streamContent, "file", file.FileName);

                // Додаємо опції пінінгу
                var options = new
                {
                    cidVersion = 1,
                    customPinPolicy = new
                    {
                        regions = new[]
                        {
                            new { id = "FRA1", desiredReplicationCount = 1 },
                            new { id = "NYC1", desiredReplicationCount = 1 }
                        }
                    }
                };
                
                content.Add(new StringContent(JsonSerializer.Serialize(options)), "pinataOptions");

                var response = await _httpClient.PostAsync($"{_ipfsApiUrl}/pinning/pinFileToIPFS", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<PinataResponse>(responseContent);
                    
                    return ServiceResponse<string>.SuccessResponse(result.IpfsHash);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return ServiceResponse<string>.ErrorResponse($"IPFS upload failed: {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"IPFS upload error: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> UploadMetadataAsync(object metadata)
        {
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
            
            return await UploadJsonAsync(json);
        }

        public async Task<ServiceResponse<string>> UploadJsonAsync(string json)
        {
            try
            {
                var content = new MultipartFormDataContent();
                var jsonContent = new StringContent(json, Encoding.UTF8, "application/json");
                content.Add(jsonContent, "file", "metadata.json");

                // Додаємо опції пінінгу для метаданих
                var options = new
                {
                    cidVersion = 1,
                    customPinPolicy = new
                    {
                        regions = new[]
                        {
                            new { id = "FRA1", desiredReplicationCount = 1 },
                            new { id = "NYC1", desiredReplicationCount = 1 }
                        }
                    }
                };
                
                content.Add(new StringContent(JsonSerializer.Serialize(options)), "pinataOptions");

                var response = await _httpClient.PostAsync($"{_ipfsApiUrl}/pinning/pinFileToIPFS", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<PinataResponse>(responseContent);
                    
                    return ServiceResponse<string>.SuccessResponse(result.IpfsHash);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return ServiceResponse<string>.ErrorResponse($"IPFS JSON upload failed: {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"IPFS JSON upload error: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<T>> GetFromIPFS<T>(string hash)
        {
            try
            {
                var url = GetIPFSUrl(hash);
                var response = await _httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions 
                    { 
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                    });
                    
                    return ServiceResponse<T>.SuccessResponse(result!);
                }
                else
                {
                    return ServiceResponse<T>.ErrorResponse($"Failed to retrieve from IPFS: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<T>.ErrorResponse($"IPFS retrieval error: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> PinToIPFS(string hash)
        {
            try
            {
                var request = new
                {
                    hashToPin = hash,
                    pinataOptions = new
                    {
                        cidVersion = 1,
                        customPinPolicy = new
                        {
                            regions = new[]
                            {
                                new { id = "FRA1", desiredReplicationCount = 1 },
                                new { id = "NYC1", desiredReplicationCount = 1 }
                            }
                        }
                    }
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(request), 
                    Encoding.UTF8, 
                    "application/json"
                );

                var response = await _httpClient.PostAsync($"{_ipfsApiUrl}/pinning/pinByHash", jsonContent);
                
                if (response.IsSuccessStatusCode)
                {
                    return ServiceResponse<string>.SuccessResponse($"Successfully pinned {hash}");
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return ServiceResponse<string>.ErrorResponse($"Pin failed: {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"Pin error: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> UnpinFromIPFS(string hash)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"{_ipfsApiUrl}/pinning/unpin/{hash}");
                
                if (response.IsSuccessStatusCode)
                {
                    return ServiceResponse<bool>.SuccessResponse(true);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return ServiceResponse<bool>.ErrorResponse($"Unpin failed: {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Unpin error: {ex.Message}");
            }
        }

        public string GetIPFSUrl(string hash)
        {
            return $"{_ipfsGatewayUrl}/{hash}";
        }

        private class PinataResponse
        {
            public string IpfsHash { get; set; } = string.Empty;
            public string PinSize { get; set; } = string.Empty;
            public string Timestamp { get; set; } = string.Empty;
        }
    }
}