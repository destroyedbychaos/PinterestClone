using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.BoardService;
using System.Security.Claims;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за операції з дошками.
    /// -----------------------------------------------
    /// Методи:
    ///     -- Створити дошку
    ///     -- Отримати всі дошки
    ///     -- Отримати дошки користувача за ID
    ///     -- Отримати дошки користувача за нікнеймом
    ///     -- Отримати дошку за ID
    ///     -- Оновити дошку
    ///     -- Видалити дошку
    ///     -- Зробити дошку приватною
    ///     -- Зробити дошку публічною
    ///     -- Заархівувати дошку
    ///     -- Розархівувати дошку
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : BaseController
    {
        private readonly IBoardService _boardService;

        public BoardsController(IBoardService boardService)
        {
            _boardService = boardService;
        }

        /// <summary>
        /// Створює нову дошку для поточного автентифікованого користувача.
        /// </summary>
        /// <param name="boardDto">Об’єкт <see cref="BoardSimpleDto"/>, що містить дані для створення дошки.</param>
        /// <returns><see cref="ActionResult{BoardResponseDto}"/> з інформацією про створену дошку.</returns>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BoardResponseDto>> CreateBoard([FromBody] BoardSimpleDto boardDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                boardDto.Id = Guid.NewGuid().ToString();

                var board = await _boardService.CreateBoardAsync(boardDto, userId);
                return Ok(board);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating board: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримує список усіх дошок з підтримкою пагінації, пошуку, сортування та групування.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <param name="searchTerm">Опціональний пошуковий запит.</param>
        /// <param name="sortBy">Поле для сортування (за замовчуванням "createdAt").</param>
        /// <param name="isAscending">Чи виконувати сортування за зростанням.</param>
        /// <param name="isArchived">Фільтр за архівованими дошками.</param>
        /// <param name="groupBy">Параметр групування.</param>
        /// <returns><see cref="ActionResult{BoardListDto}"/> зі списком дошок.</returns>
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

        /// <summary>
        /// Отримує список дошок користувача за ID з підтримкою пагінації, пошуку, сортування та групування.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням     20).</param>
        /// <param name="searchTerm">Опціональний пошуковий запит.</param>
        /// <param name="sortBy">Поле для сортування (за замовчуванням "createdAt").</param>
        /// <param name="isAscending">Чи виконувати сортування за зростанням.</param>
        /// <param name="isArchived">Фільтр за архівованими дошками.</param>
        /// <param name="groupBy">Параметр групування.</param>
        /// <returns><see cref="ActionResult{BoardListDto}"/> зі списком дошок.</returns>
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

        /// <summary>
        /// Отримує список дошок користувача за нікнеймом з підтримкою пагінації, пошуку, сортування та групування.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (за замовчуванням "createdAt").</param>
        /// <param name="isAscending">Чи виконувати сортування за зростанням.</param>
        /// <param name="isArchived">Фільтр за архівованими дошками.</param>
        /// <param name="groupBy">Параметр групування.</param>
        /// <returns><see cref="ActionResult{BoardListDto}"/> зі списком дошок.</returns>
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

        /// <summary>
        /// Отримує дошку за її ID.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <returns><see cref="ActionResult{BoardResponseDto}"/> з інформацією про дошку або інформацією про помилку.</returns>
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

        /// <summary>
        /// Оновлює дані дошки.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <param name="boardDto">Об’єкт <see cref="BoardSimpleDto"/> з оновленими даними.</param>
        /// <returns><see cref="ActionResult{BoardResponseDto}"/> з оновленою інформацією про дошку.</returns>
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

        /// <summary>
        /// Видаляє дошку.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <returns><see cref="ActionResult"/> зі статусом операції (NoContent при успіху).</returns>
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

        /// <summary>
        /// Робить дошку публічною.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <returns><see cref="ActionResult"/> з оновленою дошкою або повідомленням про помилку.</returns>
        [HttpPost("{id}/publicise")]
        [Authorize]
        public async Task<ActionResult> PubliciseBoard(string id)
        {
            if (string.IsNullOrEmpty(id)) return BadRequest("Невалідне ID дошки.");

            var result = await _boardService.PubliciseBoardAsync(id);

            if (result == null) return BadRequest("Помилка при публікації дошки.");

            return Ok(result);
        }

        /// <summary>
        /// Приватизує дошку.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <returns><see cref="ActionResult"/> з оновленою дошкою або повідомленням про помилку.</returns>
        [HttpPost("{id}/privatise")]
        [Authorize]
        public async Task<ActionResult> PrivatiseBoard(string id)
        {
            if (string.IsNullOrEmpty(id)) return BadRequest("Невалідне ID дошки.");

            var result = await _boardService.PrivatiseBoardAsync(id);

            if (result == null) return BadRequest("Помилка при публікації дошки.");

            return Ok(result);
        }

        /// <summary>
        /// Архівує дошку.
        /// </summary>
        /// <param name="id">ID дошки.</param>
        /// <returns><see cref="ActionResult{BoardResponseDto}"/> з інформацією про архівовану дошку.</returns>
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

        /// <summary>
        /// Розархівовує дошку.
        /// </summary>
        /// <param name="id">Ідентифікатор дошки.</param>
        /// <returns><see cref="ActionResult{BoardResponseDto}"/> з інформацією про відновлену дошку.</returns>
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

        /// <summary>
        /// Отримує ID поточного користувача (внутрішній метод).
        /// </summary>
        /// <returns>Рядок із ідентифікатором користувача або <c>null</c>, якщо користувач не автентифікований.</returns>
        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}