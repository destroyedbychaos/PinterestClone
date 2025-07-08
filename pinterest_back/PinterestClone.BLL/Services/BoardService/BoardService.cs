using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.BoardRepository;

namespace PinterestClone.BLL.Services.BoardService
{
    public class BoardService : IBoardService
    {
        private readonly IBoardRepository _boardRepository;

        public BoardService(IBoardRepository boardRepository)
        {
            _boardRepository = boardRepository;
        }

        public async Task<BoardResponseDto> CreateBoardAsync(BoardSimpleDto boardDto, string userId)
        {
            var board = new Board
            {
                Id = Guid.NewGuid(),
                Name = boardDto.Name,
                Description = boardDto.Description,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsPrivate = boardDto.IsPrivate,
                IsArchived = false
            };

            var createdBoard = await _boardRepository.CreateBoardAsync(board, userId);
            if (createdBoard == null) return null!;

            return new BoardResponseDto
            {
                Id = createdBoard.Id.ToString(),
                Name = createdBoard.Name,
                Description = createdBoard.Description,
                IsPrivate = createdBoard.IsPrivate,
                IsArchived = createdBoard.IsArchived,
                CreatedAt = createdBoard.CreatedAt,
                UpdatedAt = createdBoard.UpdatedAt,
                UserId = createdBoard.UserId
            };
        }

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
                query = query.OrderBy(b => prop.GetValue(b));

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BoardSimpleDto
                {
                    Id = b.Id.ToString(),
                    Name = b.Name ?? "",
                    Description = b.Description,
                    IsPrivate = b.IsPrivate,
                    IsArchived = b.IsArchived,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    UserId = b.UserId
                })
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

            var boards = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BoardSimpleDto
                {
                    Id = b.Id.ToString(),
                    Name = b.Name ?? "",
                    Description = b.Description,
                    IsPrivate = b.IsPrivate,
                    IsArchived = b.IsArchived,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    UserId = b.UserId
                })
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

        public async Task<BoardResponseDto?> GetBoardByIdAsync(string boardId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null) return null;

            return new BoardResponseDto
            {
                Id = board.Id.ToString(),
                Name = board.Name ?? string.Empty,
                Description = board.Description,
                IsPrivate = board.IsPrivate,
                IsArchived = board.IsArchived,
                CreatedAt = board.CreatedAt,
                UpdatedAt = board.UpdatedAt,
                UserId = board.UserId,
                UserName = board.User?.UserName ?? string.Empty,
                Pins = board.BoardPins
                    .Where(bp => bp.Pin != null)
                    .OrderByDescending(bp => bp.Pin!.CreatedAt)
                    .Select(bp => new PinSimpleDto
                    {
                        Id = bp.Pin!.Id.ToString(),
                        Title = bp.Pin.Title ?? string.Empty,
                        ImageUrl = bp.Pin.ImageUrl ?? string.Empty,
                        CreatedAt = bp.Pin.CreatedAt,
                        Tags = bp.Pin.Tags,
                        UserName = bp.Pin.User?.UserName ?? string.Empty,
                        LikesCount = bp.Pin.Likes.Count
                    }).ToList()
            };
        }

        public async Task<BoardResponseDto?> UpdateBoardAsync(string boardId, BoardSimpleDto updateBoard, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);

            if (board == null || board.UserId != userId)
                return null;

            board.Name = updateBoard.Name;
            board.Description = updateBoard.Description;
            board.IsPrivate = updateBoard.IsPrivate;
            board.UpdatedAt = DateTime.UtcNow;

            await _boardRepository.UpdateBoardAsync(boardId, board, userId);

            return await GetBoardByIdAsync(boardId);
        }

        public async Task<bool> DeleteBoardAsync(string boardId)
        {
            return await _boardRepository.DeleteBoardAsync(boardId);
        }

        public async Task<BoardResponseDto?> ArchiveBoardAsync(string boardId, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);
            if (board == null || board.UserId != userId)
                return null;

            board.IsArchived = true;
            board.UpdatedAt = DateTime.UtcNow;

            await _boardRepository.UpdateBoardAsync(boardId, board, userId);
            return await GetBoardByIdAsync(boardId);
        }

        public async Task<BoardResponseDto?> RestoreBoardAsync(string boardId, string userId)
        {
            var board = await _boardRepository.GetBoardByIdAsync(boardId);
            if (board == null || board.UserId != userId)
                return null;

            board.IsArchived = false;
            board.UpdatedAt = DateTime.UtcNow;

            await _boardRepository.UpdateBoardAsync(boardId, board, userId);
            return await GetBoardByIdAsync(boardId);
        }
    }
}
