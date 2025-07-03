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
                IsPrivate = boardDto.IsPrivate
            };

            var createdBoard = await _boardRepository.CreateBoardAsync(board, userId);
            if (createdBoard == null) return null!;

            return new BoardResponseDto
            {
                Id = createdBoard.Id.ToString(),
                Name = createdBoard.Name,
                Description = createdBoard.Description,
                IsPrivate = createdBoard.IsPrivate,
                CreatedAt = createdBoard.CreatedAt,
                UserId = createdBoard.UserId
            };
        }

        public async Task<BoardListDto> GetAllBoards(int pageNumber = 1, int pageSize = 20, string? searchTerm = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = _boardRepository.GetAllBoards();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(b => b.Name != null && b.Name.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BoardSimpleDto
                {
                    Id = b.Id.ToString(),
                    Name = b.Name ?? "",
                    Description = b.Description,
                    IsPrivate = b.IsPrivate,
                    CreatedAt = b.CreatedAt,
                    UserId = b.UserId
                })
                .ToListAsync();

            return new BoardListDto
            {
                Boards = boards,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<BoardListDto> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = _boardRepository.GetBoardsByUserId(userId, pageNumber, pageSize);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var boards = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BoardSimpleDto
                {
                    Id = b.Id.ToString(),
                    Name = b.Name ?? string.Empty,
                    Description = b.Description,
                    IsPrivate = b.IsPrivate,
                    CreatedAt = b.CreatedAt,
                    UserId = b.UserId
                })
                .ToListAsync();

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
                CreatedAt = board.CreatedAt,
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

            await _boardRepository.UpdateBoardAsync(boardId, board, userId);

            return await GetBoardByIdAsync(boardId);
        }

        public async Task<bool> DeleteBoardAsync(string boardId)
        {
            return await _boardRepository.DeleteBoardAsync(boardId);
        }
    }
}
