using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.BoardService
{
    public interface IBoardService
    {
        Task<BoardResponseDto> CreateBoardAsync(BoardSimpleDto boardDto, string userId);
        Task<BoardListDto> GetAllBoards(int pageNumber = 1, int pageSize = 20, string? searchTerm = null,
            string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null);
        Task<BoardListDto> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20,
            string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null);
        Task<BoardListDto> GetBoardsByUsername(string username, int pageNumber = 1, int pageSize = 20,
            string? sortBy = "createdAt", bool isAscending = false, bool? isArchived = null, string? groupBy = null);
        Task<BoardResponseDto?> GetBoardByIdAsync(string boardId);
        Task<BoardResponseDto?> UpdateBoardAsync(string boardId, BoardSimpleDto updateBoard, string userId);
        Task<bool> DeleteBoardAsync(string boardId);
        Task<BoardResponseDto?> ArchiveBoardAsync(string boardId, string userId);
        Task<BoardResponseDto?> RestoreBoardAsync(string boardId, string userId);
    }
}
