using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PhoneService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PhoneController : BaseController
    {
        private readonly IPhoneService _phoneService;

        public PhoneController(IPhoneService phoneService)
        {
            _phoneService = phoneService;
        }

        /// <summary>
        /// Додає новий номер телефону для поточного користувача та надсилає код підтвердження.
        /// </summary>
        /// <param name="dto">ї<see cref="AddPhoneNumberDto"/> що містить номер телефону користувача.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або повідомленням про помилку.</returns>
        [HttpPost("add")]
        public async Task<IActionResult> AddPhoneNumber([FromBody] AddPhoneNumberDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.AddPhoneNumberAsync(userId, dto);
            
            if (result.Success)
            {
                return Ok(new { message = "Код підтвердження відправлено на вказаний номер" });
            }

            return BadRequest(new { error = result.Message });
        }

        /// <summary>
        /// Підтверджує номер телефону користувача за допомогою коду.
        /// </summary>
        /// <param name="dto"><see cref="VerifyPhoneDto"/> що містить номер телефону та код підтвердження.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успішне підтвердження або повідомленням про помилку.</returns>
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPhoneNumber([FromBody] VerifyPhoneDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.VerifyPhoneNumberAsync(userId, dto);
            
            if (result.Success)
            {
                return Ok(new { message = "Номер телефону успішно підтверджено" });
            }

            return BadRequest(new { error = result.Message });
        }

        /// <summary>
        /// Повторно надсилає код підтвердження на вказаний номер телефону.
        /// </summary>
        /// <param name="phoneNumber"><see cref="string"/>із номером телефону, на який необхідно повторно відправити код підтвердження.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх у випадку повторної відправки коду або повідомленням про помилку.</returns>
        [HttpPost("resend")]
        public async Task<IActionResult> ResendVerificationCode([FromBody] string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                return BadRequest("номер телефона не вказано ");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.ResendVerificationCodeAsync(userId, phoneNumber);
            
            if (result.Success)
            {
                return Ok(new { message = "Код підтвердження відправлено повторно" });
            }

            return BadRequest(new { error = result.Message });
        }

        /// <summary>
        /// Отримує інформацію про номер телефону користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> з даними про номер телефону користувача
        /// або повідомленням про помилку.</returns>
        [HttpGet("info")]
        public async Task<IActionResult> GetPhoneInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.GetPhoneInfoAsync(userId);
            
            if (result.Success)
            {
                return Ok(result.Payload);
            }

            return BadRequest(new { error = result.Message });
        }

        /// <summary>
        /// Видаляє номер телефону прив’язаний до облікового запису користувача.
        /// </summary>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх у випадку видалення
        /// або повідомленням про помилку.</returns>
        [HttpDelete("remove")]
        public async Task<IActionResult> RemovePhoneNumber()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.RemovePhoneNumberAsync(userId);
            
            if (result.Success)
            {
                return Ok(new { message = "Номер телефона видалено" });
            }

            return BadRequest(new { error = result.Message });
        }

        /// <summary>
        /// Оновлює налаштування SMS-сповіщень для користувача.
        /// </summary>
        /// <param name="enableSms"><c>True</c>, щоб увімкнути SMS-сповіщення, або <c>False</c>, щоб вимкнути.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успішне оновлення налаштувань або повідомленням про помилку.</returns>
        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotificationSettings([FromBody] bool enableSms)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _phoneService.UpdateNotificationSettingsAsync(userId, enableSms);
            
            if (result.Success)
            {
                return Ok(new { message = "Налаштування повідомлень оновлено" });
            }

            return BadRequest(new { error = result.Message });
        }
    }
} 