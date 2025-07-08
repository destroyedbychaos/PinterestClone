using PinterestClone.BLL.Services;

namespace PinterestClone.BLL.Services.SmsService
{
    public interface ISmsService
    {
        Task<ServiceResponse> SendVerificationCodeAsync(string phoneNumber, string code);
        Task<ServiceResponse> SendNotificationAsync(string phoneNumber, string message);
        Task<ServiceResponse> GenerateVerificationCodeAsync();
    }
} 