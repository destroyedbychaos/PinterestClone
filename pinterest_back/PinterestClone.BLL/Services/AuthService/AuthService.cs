using PinterestClone.BLL.Services.JwtService;
using PinterestClone.BLL.Services;
using PinterestClone.DAL;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.DAL.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using PinterestClone.BLL.Services.NotificationService;
using System.Text.Json;

namespace PinterestClone.BLL.Services.AuthService
{
    /// <summary>
    /// Сервіс відповідальний за аутентифікацію користувачів.
    /// -----------------------------------------------------
    /// Методи:
    ///     -- Вхід в акаунт користувача
    ///     -- Регістрація нового користувача
    ///     -- Google аутентифікація
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly INotificationService _notificationService;
        private readonly HttpClient _httpClient;

        public AuthService(
            UserManager<User> userManager,
            IUserRepository userRepository,
            IJwtService jwtService,
            INotificationService notificationService,
            HttpClient httpClient)
        {
            _userManager = userManager;
            _userRepository = userRepository;
            _jwtService = jwtService;
            _notificationService = notificationService;
            _httpClient = httpClient;
        }

        /// <summary>
        /// Виконує вхід користувача в акаунт.
        /// </summary>
        /// <param name="model">Модель з email та паролем користувача.</param>
        /// <returns>
        /// Повертає <see cref="ServiceResponse"/>:
        /// <list type="bullet">
        ///   <item>Помилку, якщо користувача не знайдено або пароль невірний.</item>
        ///   <item>Успішний результат з JWT токенами у разі вдалого входу.</item>
        /// </list>
        /// </returns>
        public async Task<ServiceResponse> LoginAsync(LoginVM model)
        {
            var user = await _userRepository.GetByEmailAsync(model.Email);

            if (user == null)
            {
                return ServiceResponse.BadRequestResponse($"Користувача з поштою {model.Email} не знайдено");
            }

            var result = await _userRepository.CheckPasswordAsync(user, model.Password);

            if (!result)
            {
                return ServiceResponse.BadRequestResponse($"Пароль вказано невірно");
            }

            var tokens = await _jwtService.GenerateTokensAsync(user);

            if (!tokens.Success)
            {
                return ServiceResponse.BadRequestResponse("Не вдалося згенерувати токени");
            }

            await _notificationService.CreateLoginNotificationAsync(user.Id);

            return ServiceResponse.OkResponse("Успіший вхід", tokens.Payload);
        }

        /// <summary>
        /// Реєструє нового користувача в системі.
        /// </summary>
        /// <param name="model">Модель з email, паролем та додатковими даними користувача.</param>
        /// <returns>
        /// Повертає <see cref="ServiceResponse"/>:
        /// <list type="bullet">
        ///   <item>Помилку, якщо email вже використовується або створення користувача не вдалося.</item>
        ///   <item>Успішний результат з JWT токенами у разі успішної реєстрації.</item>
        /// </list>
        /// </returns>
        public async Task<ServiceResponse> RegisterAsync(RegisterVM model)
        {
            if (!await _userRepository.IsUniqueEmailAsync(model.Email))
            {
                return ServiceResponse.BadRequestResponse($"{model.Email} вже викорстовується");
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = model.Email,
                UserName = model.Email,
                DisplayName = model.Email.Split('@')[0],
                BirthDate = model.BirthDate
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return ServiceResponse.BadRequestResponse(result.Errors.First().Description);
            }

            var tokens = await _jwtService.GenerateTokensAsync(user);

            if (!tokens.Success)
            {
                return ServiceResponse.BadRequestResponse("Не вдалося згенерувати токени");
            }

            return ServiceResponse.OkResponse($"Користувач {model.Email} успішно зареєстрований", tokens.Payload);
        }

        /// <summary>
        /// Реєстрація або вхід користувача через Google OAuth.
        /// </summary>
        /// <param name="model">Модель з Google access token.</param>
        /// <returns>
        /// Повертає <see cref="ServiceResponse"/>:
        /// <list type="bullet">
        ///   <item>Помилку, якщо не вдалося отримати дані від Google або створити користувача.</item>
        ///   <item>Успішний результат з JWT токенами у разі успішної аутентифікації.</item>
        /// </list>
        /// </returns>
        // Якщо BirthDate обов'язкове поле, додайте валідацію:

        public async Task<ServiceResponse> GoogleAuthAsync(GoogleAuthVM model)
        {
            try
            {
                // 1. Отримуємо дані користувача з Google API
                var googleUserInfo = await GetGoogleUserInfoAsync(model.AccessToken);
                if (googleUserInfo == null)
                {
                    return ServiceResponse.BadRequestResponse("Не вдалося отримати дані користувача від Google");
                }

                // 2. Перевіряємо, чи існує користувач з таким email
                var existingUser = await _userRepository.GetByEmailAsync(googleUserInfo.Email);

                User user;

                if (existingUser != null)
                {
                    // 3. Якщо користувач існує — генеруємо токени
                    user = existingUser;
                    var tokensExisting = await _jwtService.GenerateTokensAsync(user);
                    if (!tokensExisting.Success)
                        return ServiceResponse.BadRequestResponse("Не вдалося згенерувати токени");

                    await _notificationService.CreateLoginNotificationAsync(user.Id);

                    return ServiceResponse.OkResponse("Успішний вхід через Google", new
                    {
                        tokens = tokensExisting.Payload,
                        user = new
                        {
                            user.Id,
                            user.Email,
                            user.DisplayName,
                            user.GoogleId
                        }
                    });
                }
                else
                {
                    // 4. Якщо користувача немає — створюємо нового
                    user = new User
                    {
                        Id = Guid.NewGuid().ToString(),
                        Email = googleUserInfo.Email,
                        UserName = googleUserInfo.Email,
                        DisplayName = googleUserInfo.Name ?? googleUserInfo.Email.Split('@')[0],
                        BirthDate = model.BirthDate ?? DateTime.UtcNow,
                        EmailConfirmed = true,
                        GoogleId = googleUserInfo.Id
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        return ServiceResponse.BadRequestResponse(
                            $"Не вдалося створити користувача: {createResult.Errors.First().Description}"
                        );
                    }

                    var tokensNew = await _jwtService.GenerateTokensAsync(user);
                    if (!tokensNew.Success)
                        return ServiceResponse.BadRequestResponse("Не вдалося згенерувати токени");

                    return ServiceResponse.OkResponse($"Користувач {googleUserInfo.Email} успішно зареєстрований через Google", new
                    {
                        tokens = tokensNew.Payload,
                        user = new
                        {
                            user.Id,
                            user.Email,
                            user.DisplayName,
                            user.GoogleId
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Помилка Google аутентифікації: {ex.Message}");
            }
        }


        /// <summary>
        /// Отримує інформацію про користувача від Google API.
        /// </summary>
        /// <param name="accessToken">Google access token.</param>
        /// <returns>Інформацію про користувача Google або null у разі помилки.</returns>
        private async Task<GoogleUserInfo?> GetGoogleUserInfoAsync(string accessToken)
        {
            try
            {
                var response = await _httpClient.GetAsync($"https://www.googleapis.com/oauth2/v2/userinfo?access_token={accessToken}");

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<GoogleUserInfo>(json, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }
            catch
            {
                return null;
            }
        }


    }

    /// <summary>
    /// Модель для представлення інформації про користувача Google.
    /// </summary>
    public class GoogleUserInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public bool Verified_Email { get; set; }
    }
}