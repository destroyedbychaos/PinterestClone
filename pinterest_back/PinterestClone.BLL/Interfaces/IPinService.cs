using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Interfaces
{
    public interface IPinService
    {
        Task<PinResponseDto> CreatePinAsync(CreatePinDto createPinDto, string userId);
        Task<PinResponseDto?> GetPinByIdAsync(Guid pinId);
        Task<PinListDto> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null);
        Task<PinListDto> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20);
        Task<PinListDto> GetBoardPinsAsync(Guid boardId, int pageNumber = 1, int pageSize = 20);
        Task<PinResponseDto?> UpdatePinAsync(Guid pinId, UpdatePinDto updatePinDto, string userId);
        Task<bool> DeletePinAsync(Guid pinId, string userId);
        Task<bool> AddPinToBoardAsync(Guid pinId, Guid boardId, string userId);
        Task<bool> RemovePinFromBoardAsync(Guid pinId, Guid boardId, string userId);
    }
} 