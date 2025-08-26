using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("pin/{pinId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCommentsForPin(Guid pinId)
        {
            try
            {
                var comments = await _context.Comments
                    .Where(c => c.PinId == pinId)
                    .Include(c => c.User)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        id = c.Id,
                        content = c.Text,
                        createdAt = c.CreatedAt,
                        userId = c.UserId,
                        user = new
                        {
                            id = c.User.Id,
                            userName = c.User.UserName,
                            displayName = c.User.DisplayName,
                            avatarUrl = c.User.AvatarUrl
                        },
                        likesCount = 0, 
                        isLiked = false
                    })
                    .ToListAsync();

                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching comments: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateComment([FromBody] CreateCommentDto createCommentDto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var pin = await _context.Pins.FindAsync(createCommentDto.PinId);
                if (pin == null)
                {
                    return NotFound("Pin not found");
                }

                var comment = new Comment
                {
                    Id = Guid.NewGuid(),
                    Text = createCommentDto.Content,
                    PinId = createCommentDto.PinId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(userId);
                var result = new
                {
                    id = comment.Id,
                    content = comment.Text,
                    createdAt = comment.CreatedAt,
                    userId = comment.UserId,
                    user = new
                    {
                        id = user.Id,
                        userName = user.UserName,
                        displayName = user.DisplayName,
                        avatarUrl = user.AvatarUrl
                    },
                    likesCount = 0,
                    isLiked = false
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating comment: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteComment(Guid id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var comment = await _context.Comments.FindAsync(id);
                if (comment == null)
                {
                    return NotFound("Comment not found");
                }

                if (comment.UserId != userId)
                {
                    return Forbid("You can only delete your own comments");
                }

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                return Ok("Comment deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting comment: {ex.Message}");
            }
        }
    }

    public class CreateCommentDto
    {
        public Guid PinId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
