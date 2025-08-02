using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.HiddenPinService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HiddenPinsController : BaseController
    {
        private readonly IHiddenPinService _hiddenPinService;

        public HiddenPinsController(IHiddenPinService hiddenPinService)
        {
            _hiddenPinService = hiddenPinService;
        }

        [HttpPost("hide")]
        public async Task<IActionResult> HidePin([FromBody] string pinId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _hiddenPinService.HidePinAsync(pinId, userId);
            return GetResult(result);
        }

        [HttpGet("hidden-ids")]
        public async Task<IActionResult> GetHiddenPinIds()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _hiddenPinService.GetHiddenPinIdsAsync(userId);
            return GetResult(result);
        }
    }
} 