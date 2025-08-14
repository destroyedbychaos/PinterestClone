using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.EmailService;
using PinterestClone.BLL.Services.PinReportService;
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
        private readonly IMapper _mapper;

        public PinReportService(IPinReportRepository pinReportRepository, IPinRepository pinRepository, IUserRepository userRepository, IEmailService emailService, IMapper mapper)
        {
            _pinReportRepository = pinReportRepository;
            _pinRepository = pinRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _mapper = mapper;
        }

        public async Task<ServiceResponse> ReportPinAsync(ReportPinDto reportPinDto, string reportedByUserId)
        {
            try
            {
                Console.WriteLine($"ReportPinAsync called with PinId: '{reportPinDto.PinId}', ReportMessage: '{reportPinDto.ReportMessage}'");
                
                if (!Guid.TryParse(reportPinDto.PinId, out var pinId))
                {
                    Console.WriteLine($"Failed to parse PinId as GUID: '{reportPinDto.PinId}'");
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
                var response = _mapper.Map<PinReportResponseDto>(pinReport);

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

                var response = _mapper.Map<PinReportResponseDto>(pinReport);
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

        private PinReportResponseDto MapToResponseDto(PinReport pinReport)
        {
            return _mapper.Map<PinReportResponseDto>(pinReport);
        }
    }
} 