using PinterestClone.DAL.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Repositories.PinViewHistoryRepository
{
    public interface IPinViewHistoryRepository
    {
        Task<PinViewHistory> AddAsync(PinViewHistory pinViewHistory);
        void Update(PinViewHistory pinViewHistory);
        Task<int> SaveChangesAsync();
        Task<List<PinViewHistory>> GetUserViewHistoryAsync(string userId, int page = 1, int pageSize = 50);
        Task<List<PinViewHistory>> GetUserViewHistoryByDateAsync(string userId, DateTime date);
        Task<List<PinViewHistory>> GetUserViewHistoryByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
        Task<int> GetUserViewHistoryCountAsync(string userId);
        Task<PinViewHistory?> GetLastViewAsync(string userId, Guid pinId);
        Task<bool> HasUserViewedPinAsync(string userId, Guid pinId);
        Task DeleteUserViewHistoryAsync(string userId);
        Task DeleteOldViewHistoryAsync(DateTime olderThan);
        Task RemoveDuplicateViewsAsync(string userId);
    }
}
