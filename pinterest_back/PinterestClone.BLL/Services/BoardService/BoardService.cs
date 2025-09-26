using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.BoardRepository;
using System.Linq.Dynamic.Core;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.BoardService
{
    /// <summary>
    /// Сервіс відповідальний за організацію дошок.
    /// -------------------------------------------
    /// Методи:
    ///     -- Створити дошку
    ///     -- Витягнути всі дошки
    ///     -- Витягнути дошки користувача по ID 
    ///     -- Отримати дошки за нікнеймом
    ///     -- Отримати дошки за ID дошки
    ///     -- Оновити інформацію про дошку
    ///     -- Видалити дошку
    ///     -- Зробити дошку приватною
    ///     -- Зробити дошку публічною
    ///     -- Заархівувати дошку
    ///     -- Розархівувати дошку
    /// </summary>
    public class BoardService : IBoardService
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IMapper _mapper;
        private readonly IUserRepository _userRepository;

        public BoardService(IBoardRepository boardRepository, IUserRepository userRepository, IMapper mapper)
        {
            _boardRepository = boardRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        /// <summary>
        /// Створює нову дошку для користувача.
        /// </summary>
        /// <param name="boardDto">Дані для створення дошки.</param>
        /// <param name="userId">ID користувача, який створює дошку.</param>
        /// <returns>Об’єкт <see cref="BoardResponseDto"/> з даними нової дошки.</returns>
        public async Task<BoardResponseDto> CreateBoardAsync(BoardSimpleDto boardDto, string userId)
        {
            var board = _mapper.Map<Board>(boardDto);
            board.UserId = userId;
            board.User = await _userRepository.GetByIdAsync(userId);

            var createdBoard = await _boardRepository.CreateBoardAsync(board, userId);
            if (createdBoard == null) return null!;

            return _mapper.Map<BoardResponseDto>(createdBoard);
        }

        /// <summary>
        /// Отримує список усіх дошок з можливістю пошуку, сортування, пагінації та групування.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <param name="searchTerm">Пошуковий запит за назвою дошки.</param>
        /// <param name="sortBy">Поле для сортування (наприклад, "createdAt").</param>
        /// <param name="isAscending">Напрямок сортування: true — зростання, false — спадання.</param>
        /// <param name="isArchived">Фільтр по архівованим дошкам.</param>
        /// <param name="groupBy">Поле для групування.</param>
        /// <returns><see cref="BoardListDto"/> зі списком або згрупованими дошками.</returns>
        public async Task<BoardListDto> GetAllBoards(int pageNumber = 1, int pageSize = 20, string? searchTerm = null,
        string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = _boardRepository.GetAllBoards();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(b => b.Name != null && b.Name.ToLower().Contains(term));
            }

            if (isArchived.HasValue)
            {
                query = query.Where(b => b.IsArchived == isArchived.Value);
            }

            Type type = typeof(Board);
            var prop = type.GetProperty(sortBy ?? string.Empty, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            if (prop == null)
                query.OrderBy(b => b.CreatedAt);
            else
                query = query.OrderBy($"{sortBy} {(isAscending ? "ascending" : "descending")}");

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await _mapper.ProjectTo<BoardSimpleDto>(query)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!string.IsNullOrWhiteSpace(groupBy))
            {
                var groupedBoards = groupBy.ToLower() switch
                {
                    "privacy" => boards.GroupBy(b => b.IsPrivate)
                        .ToDictionary(g => g.Key ? "Private" : "Public", g => g.ToList()),
                    "archived" => boards.GroupBy(b => b.IsArchived)
                        .ToDictionary(g => g.Key ? "Archived" : "Active", g => g.ToList()),
                    "createdmonth" => boards.GroupBy(b => b.CreatedAt.ToString("yyyy-MM"))
                        .ToDictionary(g => g.Key, g => g.ToList()),
                    _ => null
                };

                if (groupedBoards != null)
                {
                    return new BoardListDto
                    {
                        GroupedBoards = groupedBoards,
                        TotalCount = totalCount,
                        PageNumber = pageNumber,
                        PageSize = pageSize,
                        TotalPages = totalPages
                    };
                }
            }

            return new BoardListDto
            {
                Boards = boards,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує всі дошки певного користувача за його ID.
        /// </summary>
        /// <param name="userId">ID користувача.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).(</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (наприклад, "createdAt")ю</param>
        /// <param name="isAscending">Напрямок сортування: true — зростання, false — спадання.</param>
        /// <param name="isArchived">Фільтр по архівованим дошкам.</param>
        /// <param name="groupBy">Поле для групування.</param>
        /// <returns><see cref="BoardListDto"/> зі списком або згрупованими дошками.</returns>
        public async Task<BoardListDto> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20,
        string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = _boardRepository.GetBoardsByUserId(userId);

            if (isArchived.HasValue)
            {
                query = query.Where(b => b.IsArchived == isArchived.Value);
            }
            
            query = sortBy?.ToLower() switch
            {
                "name" => isAscending ? query.OrderBy(b => b.Name) : query.OrderByDescending(b => b.Name),
                "createdat" or "created" => isAscending ? query.OrderBy(b => b.CreatedAt) : query.OrderByDescending(b => b.CreatedAt),
                "updatedat" or "updated" => isAscending ? query.OrderBy(b => b.UpdatedAt) : query.OrderByDescending(b => b.UpdatedAt),
                _ => query.OrderByDescending(b => b.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await _mapper.ProjectTo<BoardSimpleDto>(query)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!string.IsNullOrWhiteSpace(groupBy))
            {
                var groupedBoards = groupBy.ToLower() switch
                {
                    "privacy" => boards.GroupBy(b => b.IsPrivate)
                        .ToDictionary(g => g.Key ? "Private" : "Public", g => g.ToList()),
                    "archived" => boards.GroupBy(b => b.IsArchived)
                        .ToDictionary(g => g.Key ? "Archived" : "Active", g => g.ToList()),
                    "createdmonth" => boards.GroupBy(b => b.CreatedAt.ToString("yyyy-MM"))
                        .ToDictionary(g => g.Key, g => g.ToList()),
                    _ => null
                };

                if (groupedBoards != null)
                {
                    return new BoardListDto
                    {
                        GroupedBoards = groupedBoards,
                        TotalCount = totalCount,
                        PageNumber = pageNumber,
                        PageSize = pageSize,
                        TotalPages = totalPages
                    };
                }
            }

            return new BoardListDto
            {
                Boards = boards,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує всі дошки за нікнеймом користувача.
        /// </summary>
        /// <param name="username">Нікнейм користувача.</param>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінці (за замовчуванням 20).</param>
        /// <param name="sortBy">Поле для сортування (наприклад, "createdAt").</param>
        /// <param name="isAscending">Напрямок сортування.</param>
        /// <param name="isArchived">Фільтр архівованих.</param>
        /// <param name="groupBy">Поле для групування.</param>
        /// <returns><see cref="BoardListDto"/> зі списком або згрупованими дошками.</returns>
        public async Task<BoardListDto> GetBoardsByUsername(string username, int pageNumber = 1, int pageSize = 20,
        string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = _boardRepository.GetBoardsByUsername(username);

            if (isArchived.HasValue)
            {
                query = query.Where(b => b.IsArchived == isArchived.Value);
            }
            
            query = sortBy?.ToLower() switch
            {
                "name" => isAscending ? query.OrderBy(b => b.Name) : query.OrderByDescending(b => b.Name),
                "createdat" or "created" => isAscending ? query.OrderBy(b => b.CreatedAt) : query.OrderByDescending(b => b.CreatedAt),
                "updatedat" or "updated" => isAscending ? query.OrderBy(b => b.UpdatedAt) : query.OrderByDescending(b => b.UpdatedAt),
                _ => query.OrderByDescending(b => b.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await _mapper.ProjectTo<BoardSimpleDto>(query)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!string.IsNullOrWhiteSpace(groupBy))
            {
                var groupedBoards = groupBy.ToLower() switch
                {
                    "privacy" => boards.GroupBy(b => b.IsPrivate)
                        .ToDictionary(g => g.Key ? "Private" : "Public", g => g.ToList()),
                    "archived" => boards.GroupBy(b => b.IsArchived)
                        .ToDictionary(g => g.Key ? "Archived" : "Active", g => g.ToList()),
                    "createdmonth" => boards.GroupBy(b => b.CreatedAt.ToString("yyyy-MM"))
                        .ToDictionary(g => g.Key, g => g.ToList()),
                    _ => null
                };

                if (groupedBoards != null)
                {
                    return new BoardListDto
                    {
                        GroupedBoards = groupedBoards,
                        TotalCount = totalCount,
                        PageNumber = pageNumber,
                        PageSize = pageSize,
                        TotalPages = totalPages
                    };
                }
            }

            return new BoardListDto
            {
                Boards = boards,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Отримує дошку за її унікальним ID.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <returns><see cref="BoardResponseDto"/> або <c>null</c>, якщо дошку не знайдено.</returns>
        public async Task<BoardResponseDto?> GetBoardByIdAsync(string boardId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null) return null;

            var boardDto = _mapper.Map<BoardResponseDto>(board);
            var owner = await _userRepository.GetUserAsync(board.UserId);
            boardDto.UserName = owner.DisplayName;

            return boardDto;
        }

        /// <summary>
        /// Оновлює інформацію про існуючу дошку.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="updateBoard">Модель з новими даними.</param>
        /// <param name="userId">ID власника дошки.</param>
        /// <returns>Оновлений <see cref="BoardResponseDto"/> або <c>null</c>, якщо дошка не належить користувачу.</returns>
        public async Task<BoardResponseDto?> UpdateBoardAsync(string boardId, BoardSimpleDto updateBoard, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null || board.UserId != userId)
                return null;

            var boardNew = _mapper.Map<Board>(updateBoard);
            boardNew.User = await _userRepository.GetByIdAsync(updateBoard.UserId);

            await _boardRepository.UpdateBoardAsync(boardNew);

            return await GetBoardByIdAsync(boardId);
        }

        /// <summary>
        /// Видаляє дошку за ID.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <returns><c>True</c>, якщо видалення успішне, інакше <c>False</c></returns>
        public async Task<bool> DeleteBoardAsync(string boardId)
        {
            return await _boardRepository.DeleteBoardAsync(boardId);
        }

        /// <summary>
        /// Робить дошку публічною.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <returns><see cref="BoardResponseDto"/> з оновленою дошкою або <c>null</c> при помилці.</returns>
        public async Task<BoardResponseDto?> PubliciseBoardAsync(string boardId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null) return null;

            board.IsPrivate = false;

            await _boardRepository.UpdateBoardAsync(board);

            return await GetBoardByIdAsync(boardId);
        }

        /// <summary>
        /// Робить дошку приватною.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <returns><see cref="BoardResponseDto"/> з оновленою дошкою або <c>null</c> при помилці.</returns>
        public async Task<BoardResponseDto?> PrivatiseBoardAsync(string boardId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null) return null;

            board.IsPrivate = true;

            await _boardRepository.UpdateBoardAsync(board);

            return await GetBoardByIdAsync(boardId);
        }

        /// <summary>
        /// Архівує дошку.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="userId">ID користувача-власника.</param>
        /// <returns>Оновлений <see cref="BoardResponseDto"/> або null.</returns>
        public async Task<BoardResponseDto?> ArchiveBoardAsync(string boardId, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);
            if (board == null || board.UserId != userId)
                return null;

            board.IsArchived = true;
            board.UpdatedAt = DateTime.UtcNow;

            await _boardRepository.UpdateBoardAsync(board);
            return await GetBoardByIdAsync(boardId);
        }

        /// <summary>
        /// Відновлює дошку з архіву.
        /// </summary>
        /// <param name="boardId">ID дошки.</param>
        /// <param name="userId">ID користувача-власника.</param>
        /// <returns>Оновлений <see cref="BoardResponseDto"/> або null.</returns>
        public async Task<BoardResponseDto?> RestoreBoardAsync(string boardId, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);
            if (board == null || board.UserId != userId)
                return null;

            board.IsArchived = false;
            board.UpdatedAt = DateTime.UtcNow;

            await _boardRepository.UpdateBoardAsync(board);
            return await GetBoardByIdAsync(boardId);
        }
    }
}
