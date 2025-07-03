using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.BoardRepository
{
    public class BoardRepository : IBoardRepository
    {
        private readonly AppDbContext _context;

        public BoardRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Board?> CreateBoardAsync(Board board, string userId)
        {
            _context.Boards.Add(board);
            await _context.SaveChangesAsync();
            return board;
        }

        public IQueryable<Board> GetAllBoards()
        {
            return _context.Boards
                .Include(b => b.User)
                .Include(b => b.BoardPins).ThenInclude(bp => bp.Pin).ThenInclude(p => p!.User)
                .Include(b => b.BoardPins).ThenInclude(bp => bp.Pin).ThenInclude(p => p!.Likes);
        }

        public IQueryable<Board> GetBoardsByUserId(string userId, int pageNumber = 1, int pageSize = 20)
        {
            return _context.Boards
                .Where(b => b.UserId == userId)
                .Include(b => b.User)
                .Include(b => b.BoardPins).ThenInclude(bp => bp.Pin);
        }

        public Task<Board?> GetBoardByIdAsync(string boardId)
        {
            Guid guid = new Guid(boardId);
            return _context.Boards
                .Include(b => b.User)
                .Include(b => b.BoardPins).ThenInclude(bp => bp.Pin)
                .FirstOrDefaultAsync(b => b.Id == guid);
        }

        public async Task<Board?> UpdateBoardAsync(string boardId, Board updateBoard, string userId)
        {
            _context.Boards.Update(updateBoard);
            await _context.SaveChangesAsync();
            return updateBoard;
        }

        public async Task<bool> DeleteBoardAsync(string boardId)
        {
            Guid guid = new Guid(boardId);
            var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == guid);
            if (board == null) return false;

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
