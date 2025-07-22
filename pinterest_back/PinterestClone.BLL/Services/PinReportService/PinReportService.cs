using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinReportService;
using PinterestClone.BLL.Services.EmailService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.PinReportRepository;
using PinterestClone.DAL.Repositories.PinRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.PinReportService
{
    public class PinReportService : IPinReportService
    {
        private readonly IPinReportRepository _pinReportRepository;
        private readonly IPinRepository _pinRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;

        public PinReportService(
            IPinReportRepository pinReportRepository,
            IPinRepository pinRepository,
            IUserRepository userRepository,
            IEmailService emailService)
        {
            _pinReportRepository = pinReportRepository;
            _pinRepository = pinRepository;
            _userRepository = userRepository;
            _emailService = emailService;
        }

        public async Task<ServiceResponse> ReportPinAsync(ReportPinDto reportPinDto, string reportedByUserId)
        {
            try
            {
                
                if (!Guid.TryParse(reportPinDto.PinId, out var pinId))
                {
                    return ServiceResponse.BadRequestResponse("Invalid pin ID format");
                }

                var pin = await _pinRepository.GetPinByIdAsync(pinId.ToString());
                if (pin == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin not found");
                }

                var user = await _userRepository.GetByIdAsync(reportedByUserId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var existingReport = await _pinReportRepository.GetByPinAndUserAsync(pinId, reportedByUserId);
                if (existingReport != null)
                {
                    return ServiceResponse.BadRequestResponse("You have already reported this pin");
                }

                var pinReport = new PinReport
                {
                    PinId = pinId,
                    ReportedByUserId = reportedByUserId,
                    ReportMessage = reportPinDto.ReportMessage,
                    ReportedAt = DateTime.UtcNow
                };

                var createdReport = await _pinReportRepository.CreateAsync(pinReport);

                var reportedByUserName = user.DisplayName ?? user.UserName ?? "Unknown User";
                await _emailService.SendPinReportEmailAsync(
                    pinId.ToString(),
                    pin.Title,
                    reportedByUserName,
                    reportPinDto.ReportMessage
                );

                var fullReport = await _pinReportRepository.GetByIdAsync(createdReport.Id);
                var response = MapToResponseDto(fullReport!);

                return ServiceResponse.OkResponse("Pin reported successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error reporting pin: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetReportByIdAsync(int id)
        {
            try
            {
                var pinReport = await _pinReportRepository.GetByIdAsync(id);
                if (pinReport == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin report not found");
                }

                var response = MapToResponseDto(pinReport);
                return ServiceResponse.OkResponse("Pin report retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting pin report: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var pinReports = await _pinReportRepository.GetAllReportsAsync(pageNumber, pageSize);
                var response = pinReports.Select(MapToResponseDto).ToList();

                return ServiceResponse.OkResponse("Pin reports retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting pin reports: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> ResolveReportAsync(int id, string resolutionNotes)
        {
            try
            {
                var pinReport = await _pinReportRepository.GetByIdAsync(id);
                if (pinReport == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin report not found");
                }

                pinReport.IsResolved = true;
                pinReport.ResolvedAt = DateTime.UtcNow;
                pinReport.ResolutionNotes = resolutionNotes;

                var result = await _pinReportRepository.UpdateAsync(pinReport);
                if (!result)
                {
                    return ServiceResponse.BadRequestResponse("Failed to resolve report");
                }

                return ServiceResponse.OkResponse("Report resolved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error resolving report: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> DeleteReportAsync(int id)
        {
            try
            {
                var result = await _pinReportRepository.DeleteAsync(id);
                if (!result)
                {
                    return ServiceResponse.BadRequestResponse("Pin report not found");
                }

                return ServiceResponse.OkResponse("Report deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error deleting report: {ex.Message}");
            }
        }

        private static PinReportResponseDto MapToResponseDto(PinReport pinReport)
        {
            return new PinReportResponseDto
            {
                Id = pinReport.Id,
                PinId = pinReport.PinId.ToString(),
                ReportedByUserId = pinReport.ReportedByUserId,
                ReportedByUserName = pinReport.ReportedByUser?.DisplayName ?? pinReport.ReportedByUser?.UserName ?? "Unknown",
                ReportMessage = pinReport.ReportMessage,
                ReportedAt = pinReport.ReportedAt,
                IsResolved = pinReport.IsResolved,
                ResolvedAt = pinReport.ResolvedAt,
                ResolutionNotes = pinReport.ResolutionNotes,
                Pin = new PinResponseDto
                {
                    Id = pinReport.Pin.Id.ToString(),
                    Title = pinReport.Pin.Title,
                    Description = pinReport.Pin.Description,
                    ImageUrl = pinReport.Pin.ImageUrl ?? "",
                    Link = pinReport.Pin.Link,
                    Tags = pinReport.Pin.Tags,
                    CreatedAt = pinReport.Pin.CreatedAt,
                    UserId = pinReport.Pin.UserId,
                    UserName = pinReport.Pin.User?.DisplayName ?? pinReport.Pin.User?.UserName ?? "Unknown",
                    Boards = [],
                    LikesCount = pinReport.Pin.Likes?.Count ?? 0,
                    CommentsCount = pinReport.Pin.Comments?.Count ?? 0
                }
            };
        }
    }
} 