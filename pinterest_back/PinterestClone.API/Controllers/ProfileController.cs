using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.ProfileReportService;
using PinterestClone.BLL.Services.UserBlockService;
using PinterestClone.BLL.Services.UserService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.ViewModels;
using System.Security.Claims;
using System.Threading.Tasks;
using PinterestClone.BLL.Services.UserService;
using PinterestClone.BLL.Services.ProfileReportService;
using PinterestClone.BLL.Services.UserBlockService;
using System.Text.Json;

namespace PinterestClone.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly IUserService _userService;
        private readonly IProfileReportService _profileReportService;
        private readonly IUserBlockService _userBlockService;
        private readonly IMapper _mapper;
        private readonly AppDbContext _context;


        public ProfileController(UserManager<User> userManager, IUserService userService, IProfileReportService profileReportService, IUserBlockService userBlockService, IMapper mapper, AppDbContext context)
        {
            _userManager = userManager;
            _userService = userService;
            _profileReportService = profileReportService;
            _userBlockService = userBlockService;
            _mapper = mapper;
            _context = context;

        }

        /// <summary>
        /// Оновлює профіль поточного користувача.
        /// </summary>
        /// <param name="model"><see cref="UpdateProfileVM"/> з новими даними користувача.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успішне оновлення або помилку.</returns>
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileVM model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in UpdateProfile");
                    return Unauthorized("User not found");
                }

                Console.WriteLine($"Updating profile for user: {user.Email}");
                Console.WriteLine($"Received payload: {JsonSerializer.Serialize(model)}");

                if (!string.IsNullOrWhiteSpace(model.UserName) && model.UserName != user.UserName)
                {
                    if (model.UserName.Length < 3 || model.UserName.Length > 50)
                        return BadRequest(new { error = "Username must be between 3 and 50 characters." });

                    var existing = await _userManager.FindByNameAsync(model.UserName);
                    if (existing != null && existing.Id != user.Id)
                        return BadRequest(new { error = "Username already taken." });

                    var setNameResult = await _userManager.SetUserNameAsync(user, model.UserName);
                    if (!setNameResult.Succeeded)
                        return BadRequest(new { errors = setNameResult.Errors });
                }

                if (model.DisplayName is not null)
                {
                    user.DisplayName = string.IsNullOrWhiteSpace(model.DisplayName) ? null : model.DisplayName.Trim();
                }
                if (model.Bio is not null) user.Bio = model.Bio;
                if (model.Country is not null) user.Country = model.Country;
                if (model.Language is not null) user.Language = model.Language;
                if (model.DateOfBirth is not null) user.BirthDate = model.DateOfBirth.Value;
                if (model.ProfileImageUrl is not null)
                    user.AvatarUrl = string.IsNullOrWhiteSpace(model.ProfileImageUrl) ? null : model.ProfileImageUrl;
                if (model.BannerImageUrl is not null)
                    user.BannerUrl = string.IsNullOrWhiteSpace(model.BannerImageUrl) ? null : model.BannerImageUrl;

                if (model.Interests != null)
                {
                    user.InterestsList = model.Interests.Where(i => !string.IsNullOrWhiteSpace(i)).ToList();
                    Console.WriteLine($"Updated interests: {JsonSerializer.Serialize(user.InterestsList)}");
                }

                if (model.Vibes != null)
                {
                    user.VibesList = model.Vibes.Where(v => !string.IsNullOrWhiteSpace(v)).ToList();
                    Console.WriteLine($"Updated vibes: {JsonSerializer.Serialize(user.VibesList)}");
                }

                if (!user.OnboardingCompleted)
                {
                    user.OnboardingCompleted = true;
                    user.OnboardingCompletedAt = DateTime.UtcNow;
                    Console.WriteLine("Marking onboarding as completed");
                }

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    Console.WriteLine($"Update failed: {JsonSerializer.Serialize(updateResult.Errors)}");
                    return BadRequest(new { errors = updateResult.Errors });
                }

                Console.WriteLine($"Profile updated successfully for user: {user.Email}");

                var updatedUserDto = _mapper.Map<UserProfileDto>(user);

                try
                {
                    var followersCount = await _userService.GetFollowersCountAsync(user.Id);
                    var followingCount = await _userService.GetFollowingCountAsync(user.Id);

                    updatedUserDto.FollowersCount = followersCount.Success ? (int)followersCount.Payload : 0;
                    updatedUserDto.FollowingCount = followingCount.Success ? (int)followingCount.Payload : 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Could not fetch follower counts: {ex.Message}");
                }

                return Ok(new
                {
                    message = "Profile updated successfully.",
                    user = updatedUserDto
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateProfile: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { error = "Update failed", details = ex.Message });
            }
        }

        [HttpPost("add-interests")]
        public async Task<IActionResult> AddInterests([FromBody] List<string> interests)
        {
            try
            {
                if (interests == null || !interests.Any())
                    return BadRequest("No interests provided.");

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                user.InterestsList ??= new List<string>();

                var newInterests = interests.Except(user.InterestsList).ToList();
                if (newInterests.Any())
                {
                    var updated = user.InterestsList.Concat(newInterests).ToList();
                    user.InterestsList = updated;
                    await _userManager.UpdateAsync(user);
                }

                return Ok(new
                {
                    message = "Interests updated successfully.",
                    interests = user.InterestsList
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddInterests: {ex.Message}");
                return BadRequest("Failed to update interests");
            }
        }

        [HttpPost("add-vibes")]
        public async Task<IActionResult> AddVibes([FromBody] List<string> vibes)
        {
            try
            {
                if (vibes == null || !vibes.Any())
                    return BadRequest("No vibes provided.");

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                user.VibesList ??= new List<string>();

                var newVibes = vibes.Except(user.VibesList).ToList();
                if (newVibes.Any())
                {
                    var updated = user.VibesList.Concat(newVibes).ToList();
                    user.VibesList = updated;
                    await _userManager.UpdateAsync(user);
                }

                return Ok(new
                {
                    message = "Vibes updated successfully.",
                    vibes = user.VibesList
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddVibes: {ex.Message}");
                return BadRequest("Failed to update vibes");
            }
        }


        [HttpPut("update-interests-vibes")]
        public async Task<IActionResult> UpdateInterestsAndVibes([FromBody] UpdateInterestsVibesDto model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in UpdateInterestsAndVibes");
                    return Unauthorized("User not found");
                }

                Console.WriteLine($"Updating interests and vibes for user: {user.Email}");

                if (model.Interests != null)
                    user.InterestsList = model.Interests;
                if (model.Vibes != null)
                    user.VibesList = model.Vibes;

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                    return BadRequest(updateResult.Errors);

                Console.WriteLine($"Interests and vibes updated successfully for user: {user.Email}");
                return Ok(new { message = "Interests and vibes updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateInterestsAndVibes: {ex.Message}");
                return BadRequest("Update failed");
            }
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                Console.WriteLine($"User BirthDate from database: {user.BirthDate}");
                Console.WriteLine($"User Gender from database: {user.Gender}");
                Console.WriteLine($"User Gender type: {user.Gender?.GetType()}");
                Console.WriteLine($"User Gender is null: {user.Gender == null}");
                
                var userPasswords = new Dictionary<string, string>();
                
                var settings = new
                {
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    displayName = user.DisplayName,
                    userName = user.UserName,
                    bio = user.Bio,
                    birthDate = user.BirthDate,
                    gender = user.Gender,
                    country = user.Country,
                    language = user.Language,
                    isProfilePublic = user.IsProfilePublic,
                    isSearchPrivate = user.IsSearchPrivate,
                    password = "•••••••••" 
                };

                Console.WriteLine($"Returning settings object: {System.Text.Json.JsonSerializer.Serialize(settings)}");
                Console.WriteLine($"Returning gender: {settings.gender}");

                return Ok(settings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetSettings: {ex.Message}");
                return BadRequest("Failed to get settings");
            }
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsVM model)
        {
            try
            {
                Console.WriteLine($"UpdateSettings called with model: {System.Text.Json.JsonSerializer.Serialize(model)}");
                Console.WriteLine($"Model Gender: {model.Gender}");
                
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");
                
                Console.WriteLine($"Current user Gender before update: {user.Gender}");

                if (!string.IsNullOrWhiteSpace(model.Email) && model.Email != user.Email)
                {
                    var existing = await _userManager.FindByEmailAsync(model.Email);
                    if (existing != null && existing.Id != user.Id)
                        return BadRequest(new { error = "Email already taken." });

                    var setEmailResult = await _userManager.SetEmailAsync(user, model.Email);
                    if (!setEmailResult.Succeeded)
                        return BadRequest(setEmailResult.Errors);
                }

                if (!string.IsNullOrWhiteSpace(model.UserName) && model.UserName != user.UserName)
                {
                    var existing = await _userManager.FindByNameAsync(model.UserName);
                    if (existing != null && existing.Id != user.Id)
                        return BadRequest(new { error = "Username already taken." });

                    var setUserNameResult = await _userManager.SetUserNameAsync(user, model.UserName);
                    if (!setUserNameResult.Succeeded)
                        return BadRequest(setUserNameResult.Errors);
                }

                if (model.PhoneNumber is not null)
                    user.PhoneNumber = model.PhoneNumber;
                if (model.DisplayName is not null)
                    user.DisplayName = model.DisplayName;
                if (model.Bio is not null)
                    user.Bio = model.Bio;
                if (model.BirthDate is not null)
                {
                    Console.WriteLine($"Updating BirthDate from {user.BirthDate} to {model.BirthDate.Value}");
                    user.BirthDate = model.BirthDate.Value;
                }
                if (model.Gender is not null)
                {
                    Console.WriteLine($"Updating Gender from '{user.Gender}' to '{model.Gender}'");
                    user.Gender = model.Gender;
                    Console.WriteLine($"User Gender after update: {user.Gender}");
                }
                if (model.Country is not null)
                    user.Country = model.Country;
                if (model.Language is not null)
                    user.Language = model.Language;
                if (model.IsProfilePublic is not null)
                    user.IsProfilePublic = model.IsProfilePublic.Value;
                if (model.IsSearchPrivate is not null)
                    user.IsSearchPrivate = model.IsSearchPrivate.Value;

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                    return BadRequest(updateResult.Errors);

                Console.WriteLine($"User Gender after database update: {user.Gender}");
                Console.WriteLine($"Update result succeeded: {updateResult.Succeeded}");

                return Ok(new { message = "Settings updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateSettings: {ex.Message}");
                return BadRequest("Update failed");
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordVM model)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                // var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                
                // Замість цього встановлюємо новий пароль напряму
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

                if (!result.Succeeded)
                    return BadRequest(result.Errors);


                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ChangePassword: {ex.Message}");
                return BadRequest("Password change failed");
            }
        }

        [HttpPost("deactivate")]
        public async Task<IActionResult> DeactivateAccount()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                Console.WriteLine($"Deactivating account for user: {user.Email}");

                user.IsProfilePublic = false;
                

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    Console.WriteLine($"Failed to deactivate account for user: {user.Email}");
                    return BadRequest(updateResult.Errors);
                }

                Console.WriteLine($"Account deactivated successfully for user: {user.Email}");
                return Ok(new { message = "Account deactivated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeactivateAccount: {ex.Message}");
                return BadRequest("Deactivation failed");
            }
        }

        

        /// <summary>
        /// Завантажує аватарку користувача.
        /// </summary>
        /// <param name="imageService">Сервіс для роботи з зображеннями.</param>
        /// <param name="model"><see cref="FileUploadVM"/> з файлом зображення.</param>
        /// <returns><see cref="IActionResult"/> з URL нового аватара або повідомленням про помилку.</returns>
        [HttpPost("upload-avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar(
        [FromServices] PinterestClone.BLL.Services.ImageService.IImageService imageService,
        [FromForm] FileUploadVM model)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in UploadAvatar");
                    return Unauthorized("User not found");
                }

                if (model.File == null) return BadRequest("Image file is required");

                Console.WriteLine($"Uploading avatar for user: {user.Email}");

                if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
                    await imageService.DeleteImageAsync(user.AvatarUrl);

                var (_, fileName, _, _) = await imageService.SaveImageAsync(model.File);
                var url = imageService.GetImageUrl(fileName);
                user.AvatarUrl = url;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded) return BadRequest(result.Errors);

                Console.WriteLine($"Avatar uploaded successfully: {url}");
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadAvatar: {ex.Message}");
                return BadRequest("Upload failed");
            }
        }

        /// <summary>
        /// Модель для завантаження файлу.
        /// </summary>
        public class FileUploadVM
        {
            /// <summary>
            /// Файл зображення, який потрібно завантажити.
            /// </summary>
            public IFormFile File { get; set; }
        }

        public class UpdateInterestsVibesDto
        {
            public List<string>? Interests { get; set; }
            public List<string>? Vibes { get; set; }
        }

        /// <summary>
        /// Завантажує банер користувача.
        /// </summary>
        /// <param name="imageService">Сервіс для роботи з зображеннями.</param>
        /// <param name="model"><see cref="FileUploadVM"/> з файлом зображення.</param>
        /// <returns><see cref="IActionResult"/> з URL нового банера або повідомленням про помилку.</returns>
        [HttpPost("upload-banner")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadBanner(
            [FromServices] PinterestClone.BLL.Services.ImageService.IImageService imageService,
            [FromForm] FileUploadVM model)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in UploadBanner");
                    return Unauthorized("User not found");
                }

                if (model.File == null)
                    return BadRequest("Image file is required");

                Console.WriteLine($"Uploading banner for user: {user.Email}");

                if (!string.IsNullOrWhiteSpace(user.BannerUrl))
                    await imageService.DeleteImageAsync(user.BannerUrl);

                var (_, fileName, _, _) = await imageService.SaveImageAsync(model.File);
                var url = imageService.GetImageUrl(fileName);
                user.BannerUrl = url;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                Console.WriteLine($"Banner uploaded successfully: {url}");
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadBanner: {ex.Message}");
                return BadRequest("Upload failed");
            }
        }


        /// <summary>
        /// Скидає профіль користувача до початкових значень.
        /// </summary>
        /// <param name="imageService">Сервіс для роботи з зображеннями.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успішне скидання або помилку.</returns>
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
            user.InterestsList = new List<string>();
            user.VibesList = new List<string>();
            user.OnboardingCompleted = false;
            user.OnboardingCompletedAt = null;

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


        /// <summary>
        /// Змінює email та нікнейм на новий email.
        /// </summary>
        /// <param name="model"><see cref="ChangeEmailVM"/> з новим email.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
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

            var userNameResult = await _userManager.SetUserNameAsync(user, model.NewEmail);
            if (!userNameResult.Succeeded) return BadRequest(userNameResult.Errors);

            return Ok(new { message = "Email changed successfully." });
        }


        /// <summary>
        /// Видаляє обліковий запис користувача.
        /// </summary>
        /// <param name="model"><see cref="DeleteAccountVM"/> з паролем користувача.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успішне видалення або помилку.</returns>
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

        /// <summary>
        /// Отримує інформацію про профіль поточного користувача.
        /// </summary>
        /// <returns><see cref="ActionResult{UserProfileDto}"/> з даними користувача або помилкою аутентифікації.</returns>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in GetMyProfile");
                    return Unauthorized("User not found");
                }

                Console.WriteLine($"User found: {user.Email}, ID: {user.Id}");

                var userDto = _mapper.Map<UserProfileDto>(user);

                var followersCount = await _userService.GetFollowersCountAsync(user.Id);
                var followingCount = await _userService.GetFollowingCountAsync(user.Id);

                userDto.FollowersCount = followersCount.Success ? (int)followersCount.Payload : 0;
                userDto.FollowingCount = followingCount.Success ? (int)followingCount.Payload : 0;

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMyProfile: {ex.Message}");
                return Unauthorized("Authentication error");
            }
        }

        /// <summary>
        /// Отримує публічний профіль користувача за публічним іменем.
        /// </summary>
        /// <param name="displayName">Публічне ім’я користувача.</param>
        /// <returns><see cref="ActionResult{UserProfileDto}"/> з даними користувача.</returns>
        [HttpGet("{displayName}")]
        [AllowAnonymous]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(string displayName)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.DisplayName == displayName);

            if (user == null) return NotFound();

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            bool isBlocked = false;
            bool isBlockedBy = false;

            if (!string.IsNullOrEmpty(currentUserId) && currentUserId != user.Id)
            {
                var isBlockedResponse = await _userService.IsBlockedAsync(currentUserId, user.Id);
                var isBlockedByResponse = await _userService.IsBlockedAsync(user.Id, currentUserId);

                isBlocked = isBlockedResponse.Success && (bool)isBlockedResponse.Payload;
                isBlockedBy = isBlockedByResponse.Success && (bool)isBlockedByResponse.Payload;
            }

            if (!user.IsProfilePublic)
            {
                if (currentUserId != user.Id)
                    return Forbid();
            }

            var userDto = _mapper.Map<UserProfileDto>(user);

            if (!string.IsNullOrEmpty(currentUserId) && currentUserId != user.Id)
            {
                var isFollowing = await _userService.IsFollowingAsync(currentUserId, user.Id);
                userDto.IsFollowing = isFollowing.Success && (bool)isFollowing.Payload;
            }

            var followersCount = await _userService.GetFollowersCountAsync(user.Id);
            var followingCount = await _userService.GetFollowingCountAsync(user.Id);

            userDto.FollowersCount = followersCount.Success ? (int)followersCount.Payload : 0;
            userDto.FollowingCount = followingCount.Success ? (int)followingCount.Payload : 0;

            userDto.IsBlocked = isBlocked;
            userDto.IsBlockedBy = isBlockedBy;

            return Ok(userDto);
        }

        /// <summary>
        /// Отримує публічний профіль користувача за нікнеймом.
        /// </summary>
        /// <param name="username">Нікнейм користувача.</param>
        /// <returns><see cref="ActionResult{UserProfileDto}"/> з даними користувача.</returns>
        [HttpGet("username/{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<UserProfileDto>> GetUserProfileByUsername(string username)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null) return NotFound();

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            bool isBlocked = false;
            bool isBlockedBy = false;

            if (!string.IsNullOrEmpty(currentUserId) && currentUserId != user.Id)
            {
                var isBlockedResponse = await _userService.IsBlockedAsync(currentUserId, user.Id);
                var isBlockedByResponse = await _userService.IsBlockedAsync(user.Id, currentUserId);

                isBlocked = isBlockedResponse.Success && (bool)isBlockedResponse.Payload;
                isBlockedBy = isBlockedByResponse.Success && (bool)isBlockedByResponse.Payload;
            }

            if (!user.IsProfilePublic)
            {
                if (currentUserId != user.Id)
                    return Forbid();
            }

            var userDto = _mapper.Map<UserProfileDto>(user);

            if (!string.IsNullOrEmpty(currentUserId) && currentUserId != user.Id)
            {
                var isFollowing = await _userService.IsFollowingAsync(currentUserId, user.Id);
                userDto.IsFollowing = isFollowing.Success && (bool)isFollowing.Payload;
            }

            var followersCount = await _userService.GetFollowersCountAsync(user.Id);
            var followingCount = await _userService.GetFollowingCountAsync(user.Id);

            userDto.FollowersCount = followersCount.Success ? (int)followersCount.Payload : 0;
            userDto.FollowingCount = followingCount.Success ? (int)followingCount.Payload : 0;

            userDto.IsBlocked = isBlocked;
            userDto.IsBlockedBy = isBlockedBy;

            return Ok(userDto);
        }


        /// <summary>
        /// Пошук користувачів за текстовим запитом з пагінацією.
        /// </summary>
        /// <param name="query">Текстовий запит для пошуку.</param>
        /// <param name="page">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <returns><see cref="ActionResult{IEnumerable{UserSearchDto}}"/> з результатами пошуку та інформацією про пагінацію.</returns>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<UserSearchDto>>> Search(
            [FromQuery] string query = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var usersQuery = _userManager.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var normalizedQuery = query.Trim().ToLower();
                usersQuery = usersQuery.Where(u =>
                    u.UserName.ToLower().Contains(normalizedQuery) ||
                    (u.DisplayName != null && u.DisplayName.ToLower().Contains(normalizedQuery)) ||
                    (u.Email != null && u.Email.ToLower().Contains(normalizedQuery))
                );
            }

            if (!string.IsNullOrEmpty(currentUserId))
            {
                usersQuery = usersQuery.Where(u => u.Id != currentUserId);
            }

            usersQuery = usersQuery.OrderBy(u => u.UserName);

            var total = await usersQuery.CountAsync();
            var users = await usersQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = _mapper.Map<IEnumerable<UserSearchDto>>(users);

            if (!string.IsNullOrEmpty(currentUserId))
            {
                var resultList = result.ToList();
                foreach (var userDto in resultList)
                {
                    var isFollowing = await _userService.IsFollowingAsync(currentUserId, userDto.Id);
                    userDto.IsFollowing = isFollowing.Success && (bool)isFollowing.Payload;
                }
                result = resultList;
            }

            return Ok(new
            {
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize),
                items = result
            });
        }


        // ����� ������ ���������� ��� ���...
        // (followers, following, follow/unfollow, report, block/unblock ����)

        /// <summary>
        /// Отримує список підписників користувача.
        /// </summary>
        /// <param name="userName">Публічне ім’я користувача.</param>
        /// <returns><see cref="ActionResult{List{UserProfileDto}}"/> зі списком фоловерів.</returns>
        [HttpGet("followers")]
        [Authorize]
        public async Task<ActionResult<List<UserProfileDto>>> GetUserFollowers(string userName)
        {
            var userResponse = await _userService.GetByUserNameAsync(userName);
            if (!userResponse.Success) return NotFound();

            UserProfileDto user = (UserProfileDto)userResponse.Payload!;

            var followersResponse = await _userService.GetFollowersAsync(user);

            if (!followersResponse.Success || followersResponse.Payload == null) return NotFound();

            List<UserProfileDto> followers = (List<UserProfileDto>)followersResponse.Payload;

            return Ok(followers);
        }

        /// <summary>
        /// Отримує список користувачів, на яких підписаний користувач.
        /// </summary>
        /// <param name="userName">Публічне ім’я користувача.</param>
        /// <returns><see cref="ActionResult{List{UserProfileDto}}"/> зі списком підписок.</returns>
        [HttpGet("following")]
        [Authorize]
        public async Task<ActionResult<List<UserProfileDto>>> GetUserFollowing(string userName)
        {
            var userResponse = await _userService.GetByUserNameAsync(userName);
            if (!userResponse.Success) return NotFound();

            UserProfileDto user = (UserProfileDto)userResponse.Payload!;

            var followingResponse = await _userService.GetFollowingAsync(user);

            if (!followingResponse.Success || followingResponse.Payload == null) return NotFound();

            List<UserProfileDto> following = (List<UserProfileDto>)followingResponse.Payload;

            return Ok(following);
        }

        /// <summary>
        /// Підписується на користувача.
        /// </summary>
        /// <param name="targetUserId">ID користувача на якого потрібно підписатися.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpPost("{targetUserId}/follow")]
        [Authorize]
        public async Task<IActionResult> FollowUser(string targetUserId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized("User not authenticated");

                if (string.IsNullOrEmpty(targetUserId))
                    return BadRequest("Target user ID is required");


                Console.WriteLine($"Following user: {currentUserId} -> {targetUserId}");

                var result = await _userService.FollowUserAsync(currentUserId, targetUserId);
                if (!result.Success)
                    return BadRequest(result.Message);

                if (currentUserId != targetUserId) 
                {
                    var follower = await _context.Users.FindAsync(currentUserId);
                    if (follower != null)
                    {
                        var notification = new Notification
                        {
                            UserId = targetUserId, 
                            Message = $"{follower.UserName} started following you",
                            Title = "New Follower 👤",
                            Type = NotificationType.System, 
                            Status = NotificationStatus.Pending,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Notifications.Add(notification);
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        /// <summary>
        /// Відписується від користувача.
        /// </summary>
        /// <param name="targetUserId">ID користувача, від якого потрібно відписатися.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpPost("{targetUserId}/unfollow")]
        public async Task<IActionResult> UnfollowUser(string targetUserId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                {
                    Console.WriteLine("CurrentUserId is null or empty");
                    return Unauthorized("User not authenticated");
                }

                if (string.IsNullOrEmpty(targetUserId))
                {
                    Console.WriteLine("TargetUserId is null or empty");
                    return BadRequest("Target user ID is required");
                }

                Console.WriteLine($"Unfollowing user: {currentUserId} -> {targetUserId}");

                var result = await _userService.UnfollowUserAsync(currentUserId, targetUserId);

                if (!result.Success)
                {
                    Console.WriteLine($"Unfollow failed: {result.Message}");
                    return BadRequest(result.Message);
                }

                Console.WriteLine("Unfollow successful");
                return Ok(result.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UnfollowUser: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Подає скаргу на користувача.
        /// </summary>
        /// <param name="userId">ID користувача, на якого подається скарга.</param>
        /// <param name="reportProfileDto"><see cref="ReportProfileDto"/> з деталями скарги.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpPost("{userId}/report")]
        public async Task<IActionResult> ReportUser(string userId, [FromBody] ReportProfileDto reportProfileDto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            if (reportProfileDto.ProfileId != userId)
            {
                return BadRequest("Profile ID mismatch");
            }

            try
            {
                var result = await _profileReportService.ReportProfileAsync(reportProfileDto, currentUserId);
                return GetResult(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ReportUser: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Блокує користувача.
        /// </summary>
        /// <param name="targetUserId">ID користувача, якого потрібно заблокувати.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpPost("{targetUserId}/block")]
        public async Task<IActionResult> BlockUser(string targetUserId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                {
                    Console.WriteLine("CurrentUserId is null or empty");
                    return Unauthorized("User not authenticated");
                }

                if (string.IsNullOrEmpty(targetUserId))
                {
                    Console.WriteLine("TargetUserId is null or empty");
                    return BadRequest("Target user ID is required");
                }

                Console.WriteLine($"Blocking user: {currentUserId} -> {targetUserId}");

                var result = await _userBlockService.BlockUserAsync(currentUserId, targetUserId);

                if (!result.Success)
                {
                    Console.WriteLine($"Block failed: {result.Message}");
                    return BadRequest(result.Message);
                }

                Console.WriteLine("Block successful");
                return Ok(result.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in BlockUser: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Розблоковує користувача.
        /// </summary>
        /// <param name="targetUserId">ID користувача, якого потрібно розблокувати.</param>
        /// <returns><see cref="IActionResult"/> з повідомленням про успіх або помилку.</returns>
        [HttpDelete("{targetUserId}/block")]
        public async Task<IActionResult> UnblockUser(string targetUserId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                {
                    Console.WriteLine("CurrentUserId is null or empty");
                    return Unauthorized("User not authenticated");
                }

                if (string.IsNullOrEmpty(targetUserId))
                {
                    Console.WriteLine("TargetUserId is null or empty");
                    return BadRequest("Target user ID is required");
                }

                Console.WriteLine($"Unblocking user: {currentUserId} -> {targetUserId}");

                var result = await _userBlockService.UnblockUserAsync(currentUserId, targetUserId);

                if (!result.Success)
                {
                    Console.WriteLine($"Unblock failed: {result.Message}");
                    return BadRequest(result.Message);
                }

                Console.WriteLine("Unblock successful");
                return Ok(result.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UnblockUser: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Перевіряє, чи заблокований користувач поточним користувачем.
        /// </summary>
        /// <param name="targetUserId">ID користувача, блокування якого перевіряється.</param>
        /// <returns><see cref="IActionResult"/> з результатом перевірки блокування (true/false) або помилкою.</returns>ІІ
        [HttpGet("{targetUserId}/block-status")]
        public async Task<IActionResult> GetBlockStatus(string targetUserId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                {
                    Console.WriteLine("CurrentUserId is null or empty");
                    return Unauthorized("User not authenticated");
                }

                if (string.IsNullOrEmpty(targetUserId))
                {
                    Console.WriteLine("TargetUserId is null or empty");
                    return BadRequest("Target user ID is required");
                }

                Console.WriteLine($"Checking block status: {currentUserId} -> {targetUserId}");

                var result = await _userBlockService.IsBlockedAsync(currentUserId, targetUserId);

                if (!result.Success)
                {
                    Console.WriteLine($"Block status check failed: {result.Message}");
                    return BadRequest(result.Message);
                }

                Console.WriteLine("Block status check successful");
                return Ok(result.Payload);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetBlockStatus: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}