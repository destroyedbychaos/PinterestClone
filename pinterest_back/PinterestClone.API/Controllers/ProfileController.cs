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
using PinterestClone.BLL.Services.UserService;
using PinterestClone.BLL.Services.ProfileReportService;
using PinterestClone.BLL.Services.UserBlockService;

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

        public ProfileController(UserManager<User> userManager, IUserService userService, IProfileReportService profileReportService, IUserBlockService userBlockService, IMapper mapper)
        {
            _userManager = userManager;
            _userService = userService;
            _profileReportService = profileReportService;
            _userBlockService = userBlockService;
            _mapper = mapper;
        }

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

                Console.WriteLine($"Profile updated successfully for user: {user.Email}");
                return Ok(new { message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateProfile: {ex.Message}");
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

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    Console.WriteLine("User not found in DeleteAccount");
                    return Unauthorized("User not found");
                }

                Console.WriteLine($"Deleting account for user: {user.Email}");

                user.AvatarUrl = null;
                user.BannerUrl = null;
                user.Bio = null;
                user.BirthDate = null;
                user.Country = null;
                user.Language = null;
                user.Gender = null;
                user.IsProfilePublic = false;

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    Console.WriteLine($"Failed to update user before deletion: {string.Join(", ", updateResult.Errors)}");
                    return BadRequest(updateResult.Errors);
                }

                var deleteResult = await _userManager.DeleteAsync(user);
                if (!deleteResult.Succeeded)
                {
                    Console.WriteLine($"Failed to delete user: {string.Join(", ", deleteResult.Errors)}");
                    return BadRequest(deleteResult.Errors);
                }

                Console.WriteLine($"Account deleted successfully for user: {user.Email}");
                return Ok(new { message = "Account deleted successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAccount: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest("Deletion failed");
            }
        }

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

        [HttpGet("followers")]
        [Authorize]
        public async Task<ActionResult<List<UserProfileDto>>> GetUserFollowers(string userName)
        {
            var userResponse = await _userService.GetByUserNameAsync(userName);
            if (!userResponse.Success) return NotFound();

            UserProfileDto user = (UserProfileDto)userResponse.Payload!;

            var followersResponse = await _userService.GetFollowersAsync(user);

            if (!followersResponse.Success || followersResponse.Payload == null ) return NotFound();

            List<UserProfileDto> followers = (List<UserProfileDto>)followersResponse.Payload;

            return Ok(followers);
        }

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

        [HttpPost("{targetUserId}/follow")]
        public async Task<IActionResult> FollowUser(string targetUserId)
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

                Console.WriteLine($"Following user: {currentUserId} -> {targetUserId}");
                
                var result = await _userService.FollowUserAsync(currentUserId, targetUserId);

                if (!result.Success)
                {
                    Console.WriteLine($"Follow failed: {result.Message}");
                    return BadRequest(result.Message);
                }

                Console.WriteLine("Follow successful");
                return Ok(result.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in FollowUser: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

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
