using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.AccountService;
using PinterestClone.BLL.Services.JwtService;
using PinterestClone.BLL.Validators;
using PinterestClone.DAL.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseController
    {
        private readonly IAuthService _accountService;
        private readonly IJwtService _jwtService;

        public AccountController(IAuthService accountService, IJwtService jwtService)
        {
            _accountService = accountService;
            _jwtService = jwtService;
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
    }
}
