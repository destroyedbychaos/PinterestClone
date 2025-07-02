using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.ViewModels;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public ProfileController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.UserName = model.UserName ?? user.UserName;
            user.Bio = model.Bio ?? user.Bio;
            user.Country = model.Country ?? user.Country;
            user.Language = model.Language ?? user.Language;
            user.BirthDate = model.DateOfBirth ?? user.BirthDate;
            user.AvatarUrl = model.ProfileImageUrl ?? user.AvatarUrl;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password changed successfully." });
        }

        [HttpPost("change-email")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.Email = model.NewEmail;
            user.UserName = model.NewEmail;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Email changed successfully." });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var isValid = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!isValid)
                return BadRequest(new { error = "Invalid password." });

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Account deleted successfully." });
        }
    }
}
