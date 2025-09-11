using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.NotificationService;
using PinterestClone.DAL.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace PinterestClone.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : BaseController
    {
        private readonly INotificationService _notificationService;
        private readonly AppDbContext _context;


        public NotificationsController(INotificationService notificationService, AppDbContext context)
        {
            _notificationService = notificationService;
            _context = context;

        }



        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] string type = "all")
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var notificationsQuery = _context.Notifications
                .Where(n => n.UserId == userId);

            if (type != "all")
            {
                notificationsQuery = type switch
                {
                    "likes" => notificationsQuery.Where(n => n.Message.Contains("liked")),
                    "comments" => notificationsQuery.Where(n => n.Message.Contains("commented")),
                    "follows" => notificationsQuery.Where(n => n.Message.Contains("following")),
                    _ => notificationsQuery
                };
            }
            else
            {
                notificationsQuery = notificationsQuery
                    .Where(n => !n.Message.Contains("Ласкаво просимо! Ви успішно увійшли в систему."));
            }

            var notifications = await notificationsQuery.ToListAsync();
            return Ok(notifications);
        }




    [HttpPost("mark-read")]
        public async Task<ActionResult<ServiceResponse>> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var response = await _notificationService.MarkAllAsReadAsync(userId);
            if (response.Success)
            {
                return Ok(response.Message);
            }
            return BadRequest(response.Message);
        }
    }
} 