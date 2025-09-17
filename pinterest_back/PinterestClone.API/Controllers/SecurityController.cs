using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.SecurityService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SecurityController : BaseController
    {
        private readonly ISecurityService _securityService;

        public SecurityController(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSecuritySettings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetSecuritySettingsAsync(userId);
            return GetResult(result);
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSecuritySettings([FromBody] SecuritySettingsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.UpdateSecuritySettingsAsync(userId, dto);
            return GetResult(result);
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetUserSessionsAsync(userId);
            return GetResult(result);
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> RevokeSession(int sessionId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.RevokeSessionAsync(userId, sessionId);
            return GetResult(result);
        }

        [HttpPost("sessions/revoke-others")]
        public async Task<IActionResult> RevokeAllOtherSessions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var currentSessionId = HttpContext.TraceIdentifier; 

            var result = await _securityService.RevokeAllOtherSessionsAsync(userId, currentSessionId);
            return GetResult(result);
        }

        [HttpGet("connected-apps")]
        public async Task<IActionResult> GetConnectedApps()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.GetConnectedAppsAsync(userId);
            return GetResult(result);
        }

        [HttpDelete("connected-apps/{appId}")]
        public async Task<IActionResult> RevokeAppAccess(int appId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _securityService.RevokeAppAccessAsync(userId, appId);
            return GetResult(result);
        }
    }
}
