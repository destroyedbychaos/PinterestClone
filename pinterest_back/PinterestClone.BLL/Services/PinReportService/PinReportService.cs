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
    /// <summary>
    /// Сервіс відповідальний за обробку скарг про пін.
    /// --------------------------------------------------
    /// Методи:
    ///     -- Надіслати скаргу про пін
    ///     -- Отримати скаргу за ID
    ///     -- Отримати всі скарги з пагінацією
    ///     -- Вирішити скаргу
    ///     -- Видалити скаргу
    /// </summary>
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

        /// <summary>
        /// Створює нову скаргу на пін.
        /// </summary>
        /// <param name="reportPinDto">Об’єкт <see cref="ReportPinDto"/> з ID піна та текстом скарги.</param>
        /// <param name="reportedByUserId">Ідентифікатор користувача, який надсилає скаргу.</param>
        /// <returns>
        /// <see cref="ServiceResponse"/> з результатом операції:
        ///     -- Успіх, якщо скаргу успішно створено та надіслано адміністратору;
        ///     -- Помилка, якщо пін або користувач не знайдено, або скарга вже існує.
        /// </returns>
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

        /// <summary>
        /// Отримує скаргу на пін за її ID.
        /// </summary>
        /// <param name="id">Ідентифікатор скарги.</param>
        /// <returns>
        /// <see cref="ServiceResponse"/> з об’єктом <see cref="PinReportResponseDto"/>:
        ///     -- Успіх, якщо скаргу знайдено;
        ///     -- Помилка, якщо скаргу не існує.
        /// </returns>
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

        /// <summary>
        /// Отримує всі скарги на піни з підтримкою пагінації.
        /// </summary>
        /// <param name="pageNumber">Номер сторінки (за замовчуванням 1).</param>
        /// <param name="pageSize">Кількість елементів на сторінку (за замовчуванням 20).</param>
        /// <returns>
        /// <see cref="ServiceResponse"/> зі списком <see cref="PinReportResponseDto"/>:
        ///     -- Успіх, якщо скарги знайдено;
        ///     -- Помилка при отриманні скарг.
        /// </returns>
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

        /// <summary>
        /// Відзначає скаргу як вирішену та додає примітки щодо вирішення.
        /// </summary>
        /// <param name="id">Ідентифікатор скарги.</param>
        /// <param name="resolutionNotes">Примітки щодо вирішення скарги.</param>
        /// <returns>
        /// <see cref="ServiceResponse"/> з результатом операції:
        ///     -- Успіх, якщо скаргу успішно вирішено;
        ///     -- Помилка, якщо скаргу не знайдено або не вдалося оновити.
        /// </returns>
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

        /// <summary>
        /// Видаляє скаргу на пін за її ID.
        /// </summary>
        /// <param name="id">Ідентифікатор скарги.</param>
        /// <returns>
        /// <see cref="ServiceResponse"/> з результатом операції:
        ///     -- Успіх, якщо скаргу успішно видалено;
        ///     -- Помилка, якщо скаргу не знайдено.
        /// </returns>
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

        /// <summary>
        /// Перетворює об’єкт <see cref="PinReport"/> у DTO для відповіді <see cref="PinReportResponseDto"/> використовуючи AutoMapper.
        /// </summary>
        /// <param name="pinReport">Об’єкт <see cref="PinReport"/> для конвертації.</param>
        /// <returns>Об’єкт <see cref="PinReportResponseDto"/>, який містить дані скарги у форматі відповіді.</returns>
        private PinReportResponseDto MapToResponseDto(PinReport pinReport)
        {
            return _mapper.Map<PinReportResponseDto>(pinReport);
        }
    }
} 