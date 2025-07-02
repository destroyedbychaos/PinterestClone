using PinterestClone.BLL.DTOs;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.Interfaces
{
    public interface IPinService
    {
        Task<PinResponseDto> CreatePinAsync(CreatePinDto createPinDto, string userId);
        Task<PinResponseDto?> GetPinByIdAsync(Guid pinId);
        Task<PinListDto> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null);
        
        /// <summary>
        /// </summary>
        /// <param name="searchTerm"></param>
        /// <param name="searchInTitle"></param>
        /// <param name="searchInDescription"></param>
        /// <param name="exactMatch"></param>
        /// <param name="pageNumber"></param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        Task<PinListDto> SearchPinsAsync(
            string searchTerm,
            bool searchInTitle = true,
            bool searchInDescription = true,
            bool exactMatch = false,
            int pageNumber = 1,
            int pageSize = 20);

        /// <summary>
        /// </summary>
        Task<PinListDto> SearchPinsByImageAsync(string imageHash, int pageNumber = 1, int pageSize = 20);

        /// <summary>
        /// </summary>
        Task<PinListDto> FindSimilarImagesAsync(IFormFile imageFile);

        Task<PinListDto> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20);
        Task<PinListDto> GetBoardPinsAsync(Guid boardId, int pageNumber = 1, int pageSize = 20);
        Task<PinResponseDto?> UpdatePinAsync(Guid pinId, UpdatePinDto updatePinDto, string userId);
        Task<bool> DeletePinAsync(Guid pinId, string userId);
        Task<bool> AddPinToBoardAsync(Guid pinId, Guid boardId, string userId);
        Task<bool> RemovePinFromBoardAsync(Guid pinId, Guid boardId, string userId);
    }
} 