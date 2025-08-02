using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.HiddenPinRepository;
using PinterestClone.DAL.Repositories.PinRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.HiddenPinService
{
    public class HiddenPinService : IHiddenPinService
    {
        private readonly IHiddenPinRepository _hiddenPinRepository;
        private readonly IPinRepository _pinRepository;
        private readonly IUserRepository _userRepository;

        public HiddenPinService(
            IHiddenPinRepository hiddenPinRepository,
            IPinRepository pinRepository,
            IUserRepository userRepository)
        {
            _hiddenPinRepository = hiddenPinRepository;
            _pinRepository = pinRepository;
            _userRepository = userRepository;
        }

        public async Task<ServiceResponse> HidePinAsync(string pinId, string userId)
        {
            try
            {
                Console.WriteLine($"HidePinAsync called with pinId: '{pinId}', userId: '{userId}'");
                
                if (!Guid.TryParse(pinId, out var pinGuid))
                {
                    Console.WriteLine($"Failed to parse pinId as GUID: '{pinId}'");
                    return ServiceResponse.BadRequestResponse("Invalid pin ID format");
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var pin = await _pinRepository.GetPinByIdAsync(pinGuid.ToString());
                if (pin == null)
                {
                    return ServiceResponse.BadRequestResponse("Pin not found");
                }

                var existingHiddenPin = await _hiddenPinRepository.GetByPinAndUserAsync(pinGuid, userId);
                if (existingHiddenPin != null)
                {
                    return ServiceResponse.BadRequestResponse("Pin is already hidden for this user");
                }

                var hiddenPin = new HiddenPin
                {
                    PinId = pinGuid,
                    UserId = userId,
                    HiddenAt = DateTime.UtcNow
                };

                await _hiddenPinRepository.CreateAsync(hiddenPin);

                return ServiceResponse.OkResponse("Pin hidden successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error hiding pin: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetHiddenPinIdsAsync(string userId)
        {
            try
            {
                Console.WriteLine($"GetHiddenPinIdsAsync called with userId: '{userId}'");
                
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ServiceResponse.BadRequestResponse("User not found");
                }

                var hiddenPinIds = await _hiddenPinRepository.GetHiddenPinIdsForUserAsync(userId);
                var response = hiddenPinIds.Select(id => id.ToString()).ToList();
                
                Console.WriteLine($"Found {response.Count} hidden pin IDs: {string.Join(", ", response)}");

                return ServiceResponse.OkResponse("Hidden pin IDs retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting hidden pin IDs: {ex.Message}");
            }
        }
    }
} 