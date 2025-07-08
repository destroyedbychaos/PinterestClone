using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;

namespace PinterestClone.BLL.Services.PhoneService
{
    public interface IPhoneService
    {
        Task<ServiceResponse> AddPhoneNumberAsync(string userId, AddPhoneNumberDto dto);
        Task<ServiceResponse> VerifyPhoneNumberAsync(string userId, VerifyPhoneDto dto);
        Task<ServiceResponse> ResendVerificationCodeAsync(string userId, string phoneNumber);
        Task<ServiceResponse> GetPhoneInfoAsync(string userId);
        Task<ServiceResponse> RemovePhoneNumberAsync(string userId);
        Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, bool enableSms);
    }
} 