using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.ViewModels;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace PinterestClone.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public ProfileController(UserManager<User> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileVM model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (!string.IsNullOrWhiteSpace(model.UserName) && model.UserName != user.UserName)
            {
                var existing = await _userManager.FindByNameAsync(model.UserName);
                if (existing != null && existing.Id != user.Id)
                    return BadRequest(new { error = "Username already taken." });

                var setNameResult = await _userManager.SetUserNameAsync(user, model.UserName);
                if (!setNameResult.Succeeded)
                    return BadRequest(setNameResult.Errors);
            }

            if (model.DisplayName is not null)
                user.DisplayName = model.DisplayName;
            if (model.Bio is not null)
                user.Bio = model.Bio;
            if (model.Country is not null)
                user.Country = model.Country;
            if (model.Language is not null)
                user.Language = model.Language;
            if (model.DateOfBirth is not null)
                user.BirthDate = model.DateOfBirth.Value;
            if (model.ProfileImageUrl is not null)
                user.AvatarUrl = string.IsNullOrWhiteSpace(model.ProfileImageUrl) ? null : model.ProfileImageUrl;
            if (model.BannerImageUrl is not null)
                user.BannerUrl = string.IsNullOrWhiteSpace(model.BannerImageUrl) ? null : model.BannerImageUrl;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(updateResult.Errors);

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPost("upload-avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar(
    [FromServices] PinterestClone.BLL.Services.ImageService.IImageService imageService,
    [FromForm] FileUploadVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            if (model.File == null) return BadRequest("Image file is required");

            if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
                await imageService.DeleteImageAsync(user.AvatarUrl);

            var (_, fileName, _, _) = await imageService.SaveImageAsync(model.File);
            var url = imageService.GetImageUrl(fileName);
            user.AvatarUrl = url;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { url });
        }


        public class FileUploadVM
        {
            public IFormFile File { get; set; }
        }

        [HttpPost("upload-banner")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadBanner(
            [FromServices] PinterestClone.BLL.Services.ImageService.IImageService imageService,
            [FromForm] FileUploadVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            if (model.File == null)
                return BadRequest("Image file is required");

            if (!string.IsNullOrWhiteSpace(user.BannerUrl))
                await imageService.DeleteImageAsync(user.BannerUrl);

            var (_, fileName, _, _) = await imageService.SaveImageAsync(model.File);
            var url = imageService.GetImageUrl(fileName);
            user.BannerUrl = url;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { url });
        }


        [HttpPost("reset")]
        public async Task<IActionResult> ResetProfile(
            [FromServices] PinterestClone.BLL.Services.ImageService.IImageService imageService)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.DisplayName = null;
            user.Bio = null;
            user.Country = null;
            user.Language = null;

            if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                await imageService.DeleteImageAsync(user.AvatarUrl);
                user.AvatarUrl = null;
            }
            if (!string.IsNullOrWhiteSpace(user.BannerUrl))
            {
                await imageService.DeleteImageAsync(user.BannerUrl);
                user.BannerUrl = null;
            }

            if (!string.IsNullOrWhiteSpace(user.Email))
            {

                var setNameResult = await _userManager.SetUserNameAsync(user, user.Email);
                if (!setNameResult.Succeeded)
                    return BadRequest(setNameResult.Errors);
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Profile reset successfully." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordVM model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(
                user,
                model.CurrentPassword ?? throw new ArgumentException("Current password is required"),
                model.NewPassword ?? throw new ArgumentException("New password is required"));

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password changed successfully." });
        }

        [HttpPost("change-email")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailVM model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (string.IsNullOrWhiteSpace(model.NewEmail))
                return BadRequest(new { error = "NewEmail is required." });

            var existing = await _userManager.FindByEmailAsync(model.NewEmail);
            if (existing != null && existing.Id != user.Id)
                return BadRequest(new { error = "Email already in use." });

            var emailResult = await _userManager.SetEmailAsync(user, model.NewEmail);
            if (!emailResult.Succeeded) return BadRequest(emailResult.Errors);

            // За потреби: синхронізуємо UserName з email (можна прибрати, якщо не треба)
            var userNameResult = await _userManager.SetUserNameAsync(user, model.NewEmail);
            if (!userNameResult.Succeeded) return BadRequest(userNameResult.Errors);

            return Ok(new { message = "Email changed successfully." });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountVM model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var isValid = await _userManager.CheckPasswordAsync(
                user,
                model.Password ?? throw new ArgumentException("Password is required"));

            if (!isValid)
                return BadRequest(new { error = "Invalid password." });

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Account deleted successfully." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            return Ok(_mapper.Map<UserProfileDto>(user));
        }

        [HttpGet("{displayName}")]
        [AllowAnonymous]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(string displayName)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.DisplayName == displayName);

            if (user == null) return NotFound();

            if (!user.IsProfilePublic)
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (currentUserId != user.Id)
                    return Forbid();
            }

            return Ok(_mapper.Map<UserProfileDto>(user));
        }
        [HttpGet("search")]
        [AllowAnonymous] 
        public async Task<ActionResult<IEnumerable<UserSearchDto>>> Search(
            [FromQuery] string query,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { error = "Query is required." });

            var normalizedQuery = query.Trim().ToLower();
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var usersQuery = _userManager.Users
                .AsNoTracking()
                .Where(u =>
                    u.UserName.ToLower().Contains(normalizedQuery) ||
                    (u.DisplayName != null && u.DisplayName.ToLower().Contains(normalizedQuery)) ||
                    (u.Email != null && u.Email.ToLower().Contains(normalizedQuery))
                )
                .OrderBy(u => u.UserName);

            var total = await usersQuery.CountAsync();
            var users = await usersQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = _mapper.Map<IEnumerable<UserSearchDto>>(users);

            return Ok(new
            {
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize),
                items = result
            });
        }
    }
}
