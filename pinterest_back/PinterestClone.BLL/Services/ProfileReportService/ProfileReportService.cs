using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.EmailService;
using PinterestClone.BLL.Services.ProfileReportService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.ProfileReportRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.ProfileReportService
{
    /// <summary>
    /// Сервіс відповідальний за скарги на профілі користувачів.
    /// --------------------------------------------------------
    /// Методи:
    ///     -- Поскаржитися на профіль
    ///     -- Отримати скаргу за ID
    ///     -- Отримати всі скарги
    ///     -- Вирішити скаргу
    ///     -- Видалити скаргу
    /// </summary>
    public class ProfileReportService : IProfileReportService
    {
        private readonly IProfileReportRepository _profileReportRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;

        public ProfileReportService(IProfileReportRepository profileReportRepository, IUserRepository userRepository, IEmailService emailService, IMapper mapper)
        {
            _profileReportRepository = profileReportRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _mapper = mapper;
        }

        /// <summary>
        /// Створює нову скаргу на профіль користувача.
        /// </summary>
        /// <param name="reportProfileDto"> <see cref="ReportProfileDto"/> який містить інформацію для створення скарги.</param>
        /// <param name="reportedByUserId">ID користувача, який скаржиться на профіль.</param>
        /// <returns><see cref="ServiceResponse"/> з результатом операції та інформацією про створену скаргу.</returns>
        public async Task<ServiceResponse> ReportProfileAsync(ReportProfileDto reportProfileDto, string reportedByUserId)
        {
            try
            {
                Console.WriteLine($"ReportProfileAsync called with ProfileId: '{reportProfileDto.ProfileId}', ReportMessage: '{reportProfileDto.ReportMessage}', ReportedByUserId: '{reportedByUserId}'");
                
                var profile = await _userRepository.GetByIdAsync(reportProfileDto.ProfileId);
                if (profile == null)
                {
                    return ServiceResponse.BadRequestResponse("Profile not found");
                }

                var user = await _userRepository.GetByIdAsync(reportedByUserId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var existingReport = await _profileReportRepository.GetByProfileAndUserAsync(reportProfileDto.ProfileId, reportedByUserId);
                if (existingReport != null)
                {
                    return ServiceResponse.BadRequestResponse("You have already reported this profile");
                }

                var profileReport = new ProfileReport
                {
                    ProfileId = reportProfileDto.ProfileId,
                    ReportedByUserId = reportedByUserId,
                    ReportMessage = reportProfileDto.ReportMessage,
                    ReportedAt = DateTime.UtcNow
                };

                var createdReport = await _profileReportRepository.CreateAsync(profileReport);

                var reportedByUserName = user.DisplayName ?? user.UserName ?? "Unknown User";
                await _emailService.SendProfileReportEmailAsync(
                    reportProfileDto.ProfileId,
                    profile.UserName,
                    reportedByUserName,
                    reportProfileDto.ReportMessage
                );

                return ServiceResponse.OkResponse("Profile reported successfully", createdReport);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error reporting profile: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримує скаргу на профіль за її ID.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="ServiceResponse"/> зі скаргою або повідомленням про помилку.</returns>
        public async Task<ServiceResponse> GetReportByIdAsync(int id)
        {
            try
            {
                var profileReport = await _profileReportRepository.GetByIdAsync(id);
                if (profileReport == null)
                {
                    return ServiceResponse.BadRequestResponse("Profile report not found");
                }

                return ServiceResponse.OkResponse("Profile report retrieved successfully", profileReport);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting profile report: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримує всі скарги з пагінацією.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Розмір сторінки (за замовчуванням 20).</param>
        /// <returns><see cref="ServiceResponse"/> зі списком скарг.</returns>
        public async Task<ServiceResponse> GetAllReportsAsync(int pageNumber = 1, int pageSize = 20)
        {
            try
            {
                var profileReports = await _profileReportRepository.GetAllReportsAsync(pageNumber, pageSize);
                return ServiceResponse.OkResponse("Profile reports retrieved successfully", profileReports);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting profile reports: {ex.Message}");
            }
        }

        /// <summary>
        /// Позначає скаргу як вирішену.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <param name="resolutionNotes">Примітки щодо вирішення скарги.</param>
        /// <returns><see cref="ServiceResponse"/> з результатом операції та оновленою скаргою.</returns>
        public async Task<ServiceResponse> ResolveReportAsync(int id, string resolutionNotes)
        {
            try
            {
                var profileReport = await _profileReportRepository.GetByIdAsync(id);
                if (profileReport == null)
                {
                    return ServiceResponse.BadRequestResponse("Profile report not found");
                }

                profileReport.IsResolved = true;
                profileReport.ResolvedAt = DateTime.UtcNow;
                profileReport.ResolutionNotes = resolutionNotes;

                var result = await _profileReportRepository.UpdateAsync(profileReport);
                if (!result)
                {
                    return ServiceResponse.InternalServerErrorResponse("Failed to update profile report");
                }

                return ServiceResponse.OkResponse("Profile report resolved successfully", profileReport);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error resolving profile report: {ex.Message}");
            }
        }

        /// <summary>
        /// Видаляє скаргу на профіль за її ID.
        /// </summary>
        /// <param name="id">ID скарги.</param>
        /// <returns><see cref="ServiceResponse"/> з результатом видалення.</returns>
        public async Task<ServiceResponse> DeleteReportAsync(int id)
        {
            try
            {
                var result = await _profileReportRepository.DeleteAsync(id);
                if (!result)
                {
                    return ServiceResponse.BadRequestResponse("Profile report not found");
                }

                return ServiceResponse.OkResponse("Profile report deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error deleting profile report: {ex.Message}");
            }
        }
    }
}
