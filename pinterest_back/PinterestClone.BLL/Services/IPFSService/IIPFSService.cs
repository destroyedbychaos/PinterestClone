using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Services.IPFSService
{
    public interface IIPFSService
    {
        Task<ServiceResponse<string>> UploadImageAsync(IFormFile file);
        Task<ServiceResponse<string>> UploadMetadataAsync(object metadata);
        Task<ServiceResponse<string>> UploadJsonAsync(string json);
        Task<ServiceResponse<T>> GetFromIPFS<T>(string hash);
        Task<ServiceResponse<string>> PinToIPFS(string hash);
        Task<ServiceResponse<bool>> UnpinFromIPFS(string hash);
        string GetIPFSUrl(string hash);
    }
}