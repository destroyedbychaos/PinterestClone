using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.ProfileReportRepository
{
    public interface IProfileReportRepository
    {
        Task<ProfileReport?> GetByIdAsync(int id);
        Task<ProfileReport?> GetByProfileAndUserAsync(string profileId, string reportedByUserId);
        Task<IEnumerable<ProfileReport>> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20);
        Task<ProfileReport> CreateAsync(ProfileReport profileReport);
        Task<bool> UpdateAsync(ProfileReport profileReport);
        Task<bool> DeleteAsync(int id);
    }
}
