using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.PinReportService
{
    public interface IPinReportService
    {
        Task<ServiceResponse> ReportPinAsync(ReportPinDto reportPinDto, string reportedByUserId);
        Task<ServiceResponse> GetReportByIdAsync(int id);
        Task<ServiceResponse> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20);
        Task<ServiceResponse> ResolveReportAsync(int id, string resolutionNotes);
        Task<ServiceResponse> DeleteReportAsync(int id);
    }
} 