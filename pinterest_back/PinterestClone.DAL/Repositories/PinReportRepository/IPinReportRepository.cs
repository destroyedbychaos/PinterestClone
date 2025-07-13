using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinReportRepository
{
    public interface IPinReportRepository
    {
        Task<PinReport?> GetByIdAsync(int id);
        Task<PinReport?> GetByPinAndUserAsync(Guid pinId, string reportedByUserId);
        Task<IEnumerable<PinReport>> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20);
        Task<PinReport> CreateAsync(PinReport pinReport);
        Task<bool> UpdateAsync(PinReport pinReport);
        Task<bool> DeleteAsync(int id);
        Task<int> GetReportsCountAsync();
    }
} 
