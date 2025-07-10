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