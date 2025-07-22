using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.EmailService;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.PasswordResetRepository;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.DAL.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace PinterestClone.BLL.Services.PasswordResetService
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetRepository _passwordResetRepository;
        private readonly IEmailService _emailService;
        private readonly UserManager<User> _userManager;

        public PasswordResetService(
            IUserRepository userRepository,
            IPasswordResetRepository passwordResetRepository,
            IEmailService emailService,
            UserManager<User> userManager)
        {
            _userRepository = userRepository;
            _passwordResetRepository = passwordResetRepository;
            _emailService = emailService;
            _userManager = userManager;
        }

        public async Task<ServiceResponse> ForgotPasswordAsync(ForgotPasswordVM model)
        {
           
            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
            {
                return ServiceResponse.BadRequestResponse($"Користувача з поштою {model.Email} не знайдено");
            }

            if (await _passwordResetRepository.HasActiveResetCodeAsync(model.Email))
            {
                return ServiceResponse.BadRequestResponse("Код для скидання пароля вже надіслано. Спробуйте пізніше або перевірте вашу пошту.");
            }

            var random = new Random();
            var code = random.Next(1000, 10000).ToString();

            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            await _passwordResetRepository.CreateResetCodeAsync(model.Email, code, expiresAt);

            var subject = "Скидання пароля - Aestify";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #e60023;'>Скидання пароля</h2>
                    <p>Ви запросили скидання пароля для вашого акаунту в Aestify.</p>
                    <p>Ваш код верифікації: <strong style='font-size: 24px; color: #e60023;'>{code}</strong></p>
                    <p>Цей код дійсний протягом 15 хвилин.</p>
                    <p>Якщо ви не запитували скидання пароля, проігноруйте це повідомлення.</p>
                    <hr>
                    <p style='font-size: 12px; color: #666;'>Це автоматичне повідомлення з Pinterest Clone</p>
                </div>";

            var emailSent = await _emailService.SendEmailAsync(model.Email, subject, body);

            if (!emailSent)
            {
                return ServiceResponse.BadRequestResponse("Не вдалося надіслати код на вашу пошту. Спробуйте пізніше.");
            }

            return ServiceResponse.OkResponse("Код для скидання пароля надіслано на вашу пошту");
        }

        public async Task<ServiceResponse> VerifyResetCodeAsync(VerifyResetCodeVM model)
        {
            var resetCode = await _passwordResetRepository.GetValidResetCodeAsync(model.Email, model.Code);

            if (resetCode == null)
            {
                return ServiceResponse.BadRequestResponse("Невірний код або код застарів");
            }

            return ServiceResponse.OkResponse("Код верифіковано успішно");
        }

        public async Task<ServiceResponse> ResetPasswordAsync(ResetPasswordVM model)
        {
            var resetCode = await _passwordResetRepository.GetValidResetCodeAsync(model.Email, model.Code);

            if (resetCode == null)
            {
                return ServiceResponse.BadRequestResponse("Невірний код або код застарів");
            }

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
            {
                return ServiceResponse.BadRequestResponse("Користувача не знайдено");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ServiceResponse.BadRequestResponse($"Помилка при зміні пароля: {errors}");
            }

            await _passwordResetRepository.MarkCodeAsUsedAsync(resetCode.Id);

            var subject = "Пароль змінено - Pinterest Clone";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #e60023;'>Пароль успішно змінено</h2>
                    <p>Ваш пароль було успішно змінено.</p>
                    <p>Якщо це були не ви, негайно зверніться до служби підтримки.</p>
                    <hr>
                    <p style='font-size: 12px; color: #666;'>Це автоматичне повідомлення з Pinterest Clone</p>
                </div>";

            await _emailService.SendEmailAsync(model.Email, subject, body);

            return ServiceResponse.OkResponse("Пароль успішно змінено");
        }
    }
} 