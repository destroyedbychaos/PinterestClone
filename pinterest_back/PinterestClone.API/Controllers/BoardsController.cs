using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.BoardService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : BaseController
    {
        private readonly IBoardService _boardService;

        public BoardsController(IBoardService boardService)
        {
            _boardService = boardService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BoardResponseDto>> CreateBoard([FromBody] BoardSimpleDto boardDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var board = await _boardService.CreateBoardAsync(boardDto, userId);
                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating board: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<BoardListDto>> GetBoards(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false,
            [FromQuery] bool? isArchived = null,
            [FromQuery] string? groupBy = null)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var boards = await _boardService.GetAllBoards(pageNumber, pageSize, searchTerm, sortBy, isAscending, isArchived, groupBy);
                return Ok(boards);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting boards: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<BoardListDto>> GetUserBoards(
            string userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false,
            [FromQuery] bool? isArchived = null,
            [FromQuery] string? groupBy = null)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var boards = await _boardService.GetBoardsByUserId(userId, pageNumber, pageSize, sortBy, isAscending, isArchived, groupBy);
                return Ok(boards);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user boards: {ex.Message}");
            }
        }

        [HttpGet("user/username/{username}")]
        public async Task<ActionResult<BoardListDto>> GetUserBoardsByUsername(
            string username,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool isAscending = false,
            [FromQuery] bool? isArchived = null,
            [FromQuery] string? groupBy = null)
        {
            try
            {
                if (pageSize > 100) pageSize = 100;
                if (pageNumber < 1) pageNumber = 1;

                var boards = await _boardService.GetBoardsByUsername(username, pageNumber, pageSize, sortBy, isAscending, isArchived, groupBy);
                return Ok(boards);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting user boards: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BoardResponseDto>> GetBoard(string id)
        {
            try
            {
                var board = await _boardService.GetBoardByIdAsync(id);
                if (board == null)
                    return NotFound("Board not found");

                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error getting board: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BoardResponseDto>> UpdateBoard(string id, [FromBody] BoardSimpleDto boardDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var board = await _boardService.UpdateBoardAsync(id, boardDto, userId);
                if (board == null)
                    return NotFound("Board not found or you don't have permission to edit it");

                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating board: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteBoard(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var result = await _boardService.DeleteBoardAsync(id);
                if (!result)
                    return NotFound("Board not found or you don't have permission to delete it");

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting board: {ex.Message}");
            }
        }

        [HttpPost("{id}/archive")]
        [Authorize]
        public async Task<ActionResult<BoardResponseDto>> ArchiveBoard(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var board = await _boardService.ArchiveBoardAsync(id, userId);
                if (board == null)
                    return NotFound("Board not found or you don't have permission to archive it");

                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error archiving board: {ex.Message}");
            }
        }

        [HttpPost("{id}/restore")]
        [Authorize]
        public async Task<ActionResult<BoardResponseDto>> RestoreBoard(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var board = await _boardService.RestoreBoardAsync(id, userId);
                if (board == null)
                    return NotFound("Board not found or you don't have permission to restore it");

                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error restoring board: {ex.Message}");
            }
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}