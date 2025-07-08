using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.SmsService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.PhoneService
{
    public class PhoneService : IPhoneService
    {
        private readonly AppDbContext _context;
        private readonly ISmsService _smsService;
        private readonly ILogger<PhoneService> _logger;

        public PhoneService(AppDbContext context, ISmsService smsService, ILogger<PhoneService> logger)
        {
            _context = context;
            _smsService = smsService;
            _logger = logger;
        }

        public async Task<ServiceResponse> AddPhoneNumberAsync(string userId, AddPhoneNumberDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber && u.Id != userId);

                if (existingUser != null)
                {
                    return ServiceResponse.BadRequestResponse("Цей номер телефона уже використовується іншим користувачем");
                }

                var oldVerifications = await _context.SmsVerifications
                    .Where(sv => sv.UserId == userId && !sv.IsUsed)
                    .ToListAsync();

                _context.SmsVerifications.RemoveRange(oldVerifications);

                var codeResult = await _smsService.GenerateVerificationCodeAsync();
                if (!codeResult.Success)
                {
                    return ServiceResponse.InternalServerErrorResponse(codeResult.Message);
                }

                var code = codeResult.Payload?.ToString();
                if (string.IsNullOrEmpty(code))
                {
                    return ServiceResponse.InternalServerErrorResponse("Помилка генерації кода");
                }

                var verification = new SmsVerification
                {
                    UserId = userId,
                    PhoneNumber = dto.PhoneNumber,
                    VerificationCode = code,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(10) 
                };

                _context.SmsVerifications.Add(verification);

                var smsResult = await _smsService.SendVerificationCodeAsync(dto.PhoneNumber, code);
                if (!smsResult.Success)
                {
                    return ServiceResponse.InternalServerErrorResponse($" Помилка відправки SMS: {smsResult.Message}");
                }

                
                user.PhoneNumber = dto.PhoneNumber;
                user.IsPhoneNumberVerified = false;
                user.PhoneNumberVerifiedAt = null;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Verification code sent to {PhoneNumber} for user {UserId}", dto.PhoneNumber, userId);

                return ServiceResponse.OkResponse("Код підтвердження відправлено на вказаний номер");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding phone number for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка додавання номера телефона");
            }
        }

        public async Task<ServiceResponse> VerifyPhoneNumberAsync(string userId, VerifyPhoneDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                var verification = await _context.SmsVerifications
                    .FirstOrDefaultAsync(sv => sv.UserId == userId && 
                                            sv.PhoneNumber == dto.PhoneNumber &&
                                            sv.VerificationCode == dto.VerificationCode &&
                                            !sv.IsUsed &&
                                            sv.ExpiresAt > DateTime.UtcNow);

                if (verification == null)
                {
                    var anyVerification = await _context.SmsVerifications
                        .FirstOrDefaultAsync(sv => sv.UserId == userId && 
                                                sv.PhoneNumber == dto.PhoneNumber &&
                                                !sv.IsUsed);

                    if (anyVerification != null)
                    {
                        anyVerification.AttemptCount++;
                        
                        if (anyVerification.AttemptCount >= 5)
                        {
                            anyVerification.IsUsed = true;
                            await _context.SaveChangesAsync();
                            return ServiceResponse.BadRequestResponse("Перевищено кількість спроб. Спробуйте новий код");
                        }
                        
                        await _context.SaveChangesAsync();
                    }

                    return ServiceResponse.BadRequestResponse("Неправильний або недісний код підтвердження");
                }

                
                verification.IsUsed = true;
                verification.UsedAt = DateTime.UtcNow;

                user.IsPhoneNumberVerified = true;
                user.PhoneNumberVerifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Phone number {PhoneNumber} verified for user {UserId}", dto.PhoneNumber, userId);

                return ServiceResponse.OkResponse("Номер телефона успішно підтверджено");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying phone number for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка підтвердження номера телефона");
            }
        }

        public async Task<ServiceResponse> ResendVerificationCodeAsync(string userId, string phoneNumber)
        {
            try
            {

                var recentVerification = await _context.SmsVerifications
                    .Where(sv => sv.UserId == userId && 
                               sv.PhoneNumber == phoneNumber &&
                               sv.CreatedAt > DateTime.UtcNow.AddMinutes(-1))
                    .FirstOrDefaultAsync();

                if (recentVerification != null)
                {
                    return ServiceResponse.BadRequestResponse("Код можна відправити повторно тільки через хвилину");
                }

                var addPhoneDto = new AddPhoneNumberDto { PhoneNumber = phoneNumber };
                return await AddPhoneNumberAsync(userId, addPhoneDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending verification code for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка повторного відправлення коду");
            }
        }

        public async Task<ServiceResponse> GetPhoneInfoAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                var phoneInfo = new PhoneInfoDto
                {
                    PhoneNumber = user.PhoneNumber,
                    IsPhoneNumberVerified = user.IsPhoneNumberVerified,
                    SmsNotificationsEnabled = user.SmsNotificationsEnabled,
                    PhoneNumberVerifiedAt = user.PhoneNumberVerifiedAt
                };

                return ServiceResponse.OkResponse(" Інформація про номер телефона", phoneInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting phone info for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка отримання інформації про номер телефона ");
            }
        }

        public async Task<ServiceResponse> RemovePhoneNumberAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено ");
                }

                user.PhoneNumber = null;
                user.IsPhoneNumberVerified = false;
                user.PhoneNumberVerifiedAt = null;
                user.SmsNotificationsEnabled = true; 

                var verifications = await _context.SmsVerifications
                    .Where(sv => sv.UserId == userId)
                    .ToListAsync();

                _context.SmsVerifications.RemoveRange(verifications);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Phone number removed for user {UserId}", userId);

                return ServiceResponse.OkResponse("Номер телефона видалено");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing phone number for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка видалення номера телефона ");
            }
        }

        public async Task<ServiceResponse> UpdateNotificationSettingsAsync(string userId, bool enableSms)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("Користувача не знайдено");
                }

                user.SmsNotificationsEnabled = enableSms;
                await _context.SaveChangesAsync();

                _logger.LogInformation("SMS notifications {Status} for user {UserId}", 
                    enableSms ? "enabled" : "disabled", userId);

                return ServiceResponse.OkResponse("Налаштування повідомлень оновлено");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification settings for user {UserId}", userId);
                return ServiceResponse.InternalServerErrorResponse("Помилка оновлень налаштувань повідомлень");
            }
        }
    }
} 