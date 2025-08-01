using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.PinService
{
    public interface IPinService
    {
        Task<PinResponseDto?> CreatePinAsync(CreatePinDto createPinDto, string userId);
        Task<PinResponseDto?> GetPinByIdAsync(string pinId);
        Task<PinListDto?> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null, string? sortBy = "createdAt", bool isAscending = false);
        Task<PinListDto?> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20, string? sortBy = "createdAt", bool isAscending = false);
        Task<PinListDto?> GetBoardPinsAsync(string boardId, int pageNumber = 1, int pageSize = 20, string? sortBy = "createdAt", bool isAscending = false);
        Task<PinResponseDto?> UpdatePinAsync(string pinId, UpdatePinDto updatePinDto, string userId);
        Task<bool> DeletePinAsync(string pinId, string userId);
        Task<bool> AddPinToBoardAsync(string pinId, string boardId, string userId);
        Task<bool> RemovePinFromBoardAsync(string pinId, string boardId, string userId);
        Task<List<string>> GetAllTagsAsync();
        Task<List<PinRecommendationDto>> GetRecommendedPinsAsync();

    }
}