using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.AuthService;
using PinterestClone.BLL.Services.JwtService;
using PinterestClone.BLL.Services.PasswordResetService;
using PinterestClone.BLL.Validators;
using PinterestClone.DAL.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace PinterestClone.API.Controllers
{
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

        [HttpGet("me")]
        public async Task<IActionResult> GetMeAsync()
        {
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var user = await _accountService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            return Ok(new { success = true, payload = user });
        }
    }
}

