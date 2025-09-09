using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.AuthService;
using PinterestClone.BLL.Services.JwtService;
using PinterestClone.BLL.Services.PasswordResetService;
using PinterestClone.BLL.Validators;
using PinterestClone.DAL.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за аутентифікацію користувачів.
    /// --------------------------------------------------------
    /// Методи:
    ///     -- Увійти в аккаунт
    ///     -- Зареєструвати новий акаунт
    ///     -- Оновити токени доступу
    ///     -- Забули пароль
    ///     -- Підтвердити код скидання паролю
    ///     -- Скинути пароль
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : BaseController
    {
        private readonly IAuthService _accountService;
        private readonly IJwtService _jwtService;
        private readonly IPasswordResetService _passwordResetService;

        public AuthController(
            IAuthService accountService, 
            IJwtService jwtService,
            IPasswordResetService passwordResetService)
        {
            _accountService = accountService;
            _jwtService = jwtService;
            _passwordResetService = passwordResetService;
        }

        /// <summary>
        /// Вхід в акаунт.
        /// </summary>
        /// <param name="model">Модель входу в акаунт.</param>
        /// <returns><see cref="IActionResult"/> з інформацією про результат входу, що містить токени доступу.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> SignInAsync([FromBody] LoginVM model)
        {
            var validator = new LoginValidator();
            var validation = await validator.ValidateAsync(model);

            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _accountService.LoginAsync(model);

            return GetResult(response);
        }

        /// <summary>
        /// Реєстрація нового акаунта.
        /// </summary>
        /// <param name="model">Модель з даними для реєстрації.</param>
        /// <returns><see cref="IActionResult"/> з результатом створення акаунта.</returns>
        [HttpPost("register")]
        public async Task<IActionResult> SignUpAsync([FromBody] RegisterVM model)
        {
            RegisterValidator validator = new RegisterValidator();
            var validation = await validator.ValidateAsync(model);

            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _accountService.RegisterAsync(model);
            return GetResult(response);
        }

        /// <summary>
        /// Оновлення токенів доступу (access/refresh).
        /// </summary>
        /// <param name="model">JWT-модель з access та refresh токенами.</param>
        /// <returns><see cref="IActionResult"/> з новими токенами.</returns>
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshTokensAsync([FromBody] JwtVM model)
        {
            if (string.IsNullOrEmpty(model.AccessToken) ||
                string.IsNullOrEmpty(model.RefreshToken))
            {
                return GetResult(ServiceResponse.BadRequestResponse("Invalid tokens"));
            }

            var response = await _jwtService.RefreshTokensAsync(model);
            return GetResult(response);
        }

        /// <summary>
        /// Запит на скидання пароля (надсилає код на email).
        /// </summary>
        /// <param name="model">Модель з email користувача.</param>
        /// <returns><see cref="IActionResult"/> з результатом запиту.</returns>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordVM model)
        {
            var validator = new ForgotPasswordValidator();
            var validation = await validator.ValidateAsync(model);

            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _passwordResetService.ForgotPasswordAsync(model);
            return GetResult(response);
        }

        /// <summary>
        /// Перевірка коду підтвердження для скидання пароля.
        /// </summary>
        /// <param name="model">Модель з email та кодом підтвердження.</param>
        /// <returns><see cref="IActionResult"/> з результатом перевірки.</returns>
        [HttpPost("verify-reset-code")]
        public async Task<IActionResult> VerifyResetCodeAsync([FromBody] VerifyResetCodeVM model)
        {
            var validator = new VerifyResetCodeValidator();
            var validation = await validator.ValidateAsync(model);

            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _passwordResetService.VerifyResetCodeAsync(model);
            return GetResult(response);
        }

        /// <summary>
        /// Скидання пароля користувача.
        /// </summary>
        /// <param name="model">Модель з новим паролем та кодом підтвердження.</param>
        /// <returns><see cref="IActionResult"/> з результатом скидання пароля.</returns>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordVM model)
        {
            var validator = new ResetPasswordValidator();
            var validation = await validator.ValidateAsync(model);

            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _passwordResetService.ResetPasswordAsync(model);
            return GetResult(response);
        }
    }
}

