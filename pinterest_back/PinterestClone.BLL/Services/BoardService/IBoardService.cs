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
        Task<BoardListDto> GetAllBoards(int pageNumber = 1, int pageSize = 20, string? searchTerm = null);
        Task<BoardListDto> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20);
        Task<BoardResponseDto?> GetBoardByIdAsync(string boardId);
        Task<BoardResponseDto?> UpdateBoardAsync(string boardId, BoardSimpleDto updateBoard, string userId);
        Task<bool> DeleteBoardAsync(string boardId);
    }
}
