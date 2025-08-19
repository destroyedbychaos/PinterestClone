using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.BLL.DTOs;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : BaseController
    {
        private readonly IPinService _pinService;

        public FavoritesController(IPinService pinService)
        {
            _pinService = pinService;
        }

        [HttpGet("user/{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<PinListDto>> GetUserSavedPins(
            string username,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;


                var pins = await _pinService.GetUserPinsByUsernameAsync(username, pageNumber, pageSize);
                
                return Ok(pins);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user saved pins: {ex.Message}");
            }
        }
    }
}
