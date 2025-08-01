using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinRepository
{
    public interface IPinRepository
    {
        Task<Pin?> CreatePinAsync(Pin pin, string userId);
        Task<Pin?> GetPinByIdAsync(string pinId);
        IQueryable<Pin> GetAllPins();
        IQueryable<Pin> GetPinsByUserid(string userId, int pageNumber = 1);
        IQueryable<Pin> GetPinsByBoardId(string boardId, int pageNumber = 1);
        Task<Pin?> UpdatePinAsync(string pinId, Pin updatePin, string userId);
        Task<bool> DeletePinAsync(Pin pin);
        Task<bool> AddPinToBoardAsync(BoardPin boardPin);
        Task<bool> RemovePinFromBoardAsync(string pinId, string boardId, string userId);
        Task<List<Pin>> GetRecommendedPinsAsync(int count);

    }
}
