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

                // PlainPassword = model.Password
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

        public async Task<object?> GetUserByIdAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return new
            {
                id = user.Id,
                email = user.Email,
                displayName = user.DisplayName,
                userName = user.UserName
            };
        }
    }
}
