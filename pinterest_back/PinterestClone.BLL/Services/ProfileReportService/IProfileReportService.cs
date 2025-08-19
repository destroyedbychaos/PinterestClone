using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.ProfileReportService
{
    public interface IProfileReportService
    {
        Task<ServiceResponse> ReportProfileAsync(ReportProfileDto reportProfileDto, string reportedByUserId);
        Task<ServiceResponse> GetReportByIdAsync(int id);
        Task<ServiceResponse> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20);
        Task<ServiceResponse> ResolveReportAsync(int id, string resolutionNotes);
        Task<ServiceResponse> DeleteReportAsync(int id);
    }
}
