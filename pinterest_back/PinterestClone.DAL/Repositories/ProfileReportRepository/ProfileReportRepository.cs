using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.ProfileReportRepository
{
    public class ProfileReportRepository : IProfileReportRepository
    {
        private readonly AppDbContext _context;

        public ProfileReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProfileReport?> GetByIdAsync(int id)
        {
            return await _context.ProfileReports
                .Include(pr => pr.Profile)
                .Include(pr => pr.ReportedByUser)
                .FirstOrDefaultAsync(pr => pr.Id == id);
        }

        public async Task<ProfileReport?> GetByProfileAndUserAsync(string profileId, string reportedByUserId)
        {
            return await _context.ProfileReports
                .FirstOrDefaultAsync(pr => pr.ProfileId == profileId && pr.ReportedByUserId == reportedByUserId);
        }

        public async Task<IEnumerable<ProfileReport>> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20)
        {
            return await _context.ProfileReports
                .Include(pr => pr.Profile)
                .Include(pr => pr.ReportedByUser)
                .OrderByDescending(pr => pr.ReportedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<ProfileReport> CreateAsync(ProfileReport profileReport)
        {
            _context.ProfileReports.Add(profileReport);
            await _context.SaveChangesAsync();
            return profileReport;
        }

        public async Task<bool> UpdateAsync(ProfileReport profileReport)
        {
            _context.ProfileReports.Update(profileReport);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var profileReport = await _context.ProfileReports.FindAsync(id);
            if (profileReport == null)
                return false;

            _context.ProfileReports.Remove(profileReport);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
