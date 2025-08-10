using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.PinShareService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.PinShareRepository;
using PinterestClone.DAL.Repositories.PinRepository;
using PinterestClone.DAL.Repositories.UserRepository;
using AutoMapper;

namespace PinterestClone.BLL.Services.PinShareService
{
    public class PinShareService : IPinShareService
    {
        private readonly IPinShareRepository _pinShareRepository;
        private readonly IPinRepository _pinRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public PinShareService(IPinShareRepository pinShareRepository, IPinRepository pinRepository, IUserRepository userRepository, IMapper mapper)
        {
            _pinShareRepository = pinShareRepository;
            _pinRepository = pinRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<ServiceResponse> SharePinAsync(SharePinDto sharePinDto, string sharedByUserId)
        {
            try
            {
               
                if (!Guid.TryParse(sharePinDto.PinId, out var pinId))
                {
                    return ServiceResponse.BadRequestResponse("Invalid pin ID format");
                }

                var pin = await _pinRepository.GetPinByIdAsync(pinId.ToString());
                if (pin == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin not found");
                }

                
                var targetUser = await _userRepository.GetByIdAsync(sharePinDto.SharedWithUserId);
                if (targetUser == null)
                {
                    return ServiceResponse.BadRequestResponse("Target user not found");
                }

                
                if (sharedByUserId == sharePinDto.SharedWithUserId)
                {
                    return ServiceResponse.BadRequestResponse("Cannot share pin with yourself");
                }


                var pinShare = new PinShare
                {
                    PinId = pinId,
                    SharedByUserId = sharedByUserId,
                    SharedWithUserId = sharePinDto.SharedWithUserId,
                    Message = sharePinDto.Message,
                    SharedAt = DateTime.UtcNow
                };

                var createdShare = await _pinShareRepository.CreateAsync(pinShare);

                var fullShare = await _pinShareRepository.GetByIdAsync(createdShare.Id);
                var response = _mapper.Map<PinShareResponseDto>(pinShare);

                return ServiceResponse.OkResponse("Pin shared successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error sharing pin: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetPinShareByIdAsync(int id)
        {
            try
            {
                var pinShare = await _pinShareRepository.GetByIdAsync(id);
                if (pinShare == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin share not found");
                }

                var response = _mapper.Map<PinShareResponseDto>(pinShare);
                return ServiceResponse.OkResponse("Pin share retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting pin share: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> MarkAsReadAsync(int id, string userId)
        {
            try
            {
                var pinShare = await _pinShareRepository.GetByIdAsync(id);
                if (pinShare == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin share not found");
                }

                if (pinShare.SharedWithUserId != userId)
                {
                    return ServiceResponse.BadRequestResponse("You don't have permission to mark this as read");
                }

                var result = await _pinShareRepository.MarkAsReadAsync(id);
                return result 
                    ? ServiceResponse.OkResponse("Marked as read successfully")
                    : ServiceResponse.BadRequestResponse("Failed to mark as read");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error marking as read: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> DeletePinShareAsync(int id, string userId)
        {
            try
            {
                var pinShare = await _pinShareRepository.GetByIdAsync(id);
                if (pinShare == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin share not found");
                }

                if (pinShare.SharedByUserId != userId && pinShare.SharedWithUserId != userId)
                {
                    return ServiceResponse.BadRequestResponse("You don't have permission to delete this share");
                }

                var result = await _pinShareRepository.DeleteAsync(id);
                return result 
                    ? ServiceResponse.OkResponse("Pin share deleted successfully")
                    : ServiceResponse.BadRequestResponse("Failed to delete pin share");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error deleting pin share: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetUnreadCountAsync(string userId)
        {
            try
            {
                var count = await _pinShareRepository.GetUnreadCountAsync(userId);
                return ServiceResponse.OkResponse("Unread count retrieved successfully", count);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting unread count: {ex.Message}");
            }
        }
    }
} 