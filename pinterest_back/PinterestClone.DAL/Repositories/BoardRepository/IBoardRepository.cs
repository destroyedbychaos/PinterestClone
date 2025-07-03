using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.BoardRepository
{
    public interface IBoardRepository
    {
        Task<Board?> CreateBoardAsync(Board board, string userId);
        IQueryable<Board> GetAllBoards();
        IQueryable<Board> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20);
        Task<Board?> GetBoardByIdAsync(string boardId);
        Task<Board?> UpdateBoardAsync(string boardId, Board updateBoard, string userId);
        Task<bool> DeleteBoardAsync(string boardId);

    }
}
