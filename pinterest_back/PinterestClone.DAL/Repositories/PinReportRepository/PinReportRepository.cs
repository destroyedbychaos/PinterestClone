using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinReportRepository
{
    public class PinReportRepository : IPinReportRepository
    {
        private readonly AppDbContext _context;

        public PinReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PinReport?> GetByIdAsync(int id)
        {
            return await _context.PinReports
                .Include(pr => pr.Pin)
                .Include(pr => pr.ReportedByUser)
                .FirstOrDefaultAsync(pr => pr.Id == id);
        }

        public async Task<PinReport?> GetByPinAndUserAsync(Guid pinId, string reportedByUserId)
        {
            return await _context.PinReports
                .FirstOrDefaultAsync(pr => pr.PinId == pinId && pr.ReportedByUserId == reportedByUserId);
        }

        public async Task<IEnumerable<PinReport>> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20)
        {
            return await _context.PinReports
                .Include(pr => pr.Pin)
                .Include(pr => pr.ReportedByUser)
                .OrderByDescending(pr => pr.ReportedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<PinReport> CreateAsync(PinReport pinReport)
        {
            _context.PinReports.Add(pinReport);
            await _context.SaveChangesAsync();
            return pinReport;
        }

        public async Task<bool> UpdateAsync(PinReport pinReport)
        {
            _context.PinReports.Update(pinReport);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pinReport = await _context.PinReports.FindAsync(id);
            if (pinReport == null)
                return false;

            _context.PinReports.Remove(pinReport);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetReportsCountAsync()
        {
            return await _context.PinReports.CountAsync();
        }
    }
} 
