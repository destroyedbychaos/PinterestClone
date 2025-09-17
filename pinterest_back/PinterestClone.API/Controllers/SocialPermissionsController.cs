using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.SocialPermissionsService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SocialPermissionsController : BaseController
    {
        private readonly ISocialPermissionsService _socialPermissionsService;

        public SocialPermissionsController(ISocialPermissionsService socialPermissionsService)
        {
            _socialPermissionsService = socialPermissionsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSocialPermissions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetSocialPermissionsAsync(userId);
            return GetResult(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSocialPermissions([FromBody] SocialPermissionsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UpdateSocialPermissionsAsync(userId, dto);
            return GetResult(result);
        }

        [HttpGet("blocked-users")]
        public async Task<IActionResult> GetBlockedUsers()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetBlockedUsersAsync(userId);
            return GetResult(result);
        }

        [HttpPost("block-user")]
        public async Task<IActionResult> BlockUser([FromBody] BlockUserRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.BlockUserAsync(userId, request.UserId);
            return GetResult(result);
        }

        [HttpDelete("unblock-user/{blockedUserId}")]
        public async Task<IActionResult> UnblockUser(string blockedUserId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UnblockUserAsync(userId, blockedUserId);
            return GetResult(result);
        }

        [HttpGet("keyword-filters")]
        public async Task<IActionResult> GetKeywordFilters()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.GetKeywordFiltersAsync(userId);
            return GetResult(result);
        }

        [HttpPut("keyword-filters")]
        public async Task<IActionResult> UpdateKeywordFilters([FromBody] KeywordFilterDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _socialPermissionsService.UpdateKeywordFiltersAsync(userId, dto);
            return GetResult(result);
        }
    }

    public class BlockUserRequest
    {
        public string UserId { get; set; }
    }
}
