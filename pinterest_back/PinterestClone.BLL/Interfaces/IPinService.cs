using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Interfaces
{
    public interface IPinService
    {
        Task<PinResponseDto> CreatePinAsync(CreatePinDto createPinDto, string userId);
        Task<PinResponseDto?> GetPinByIdAsync(Guid pinId);
        Task<PinListDto> GetPinsAsync(int pageNumber = 1, int pageSize = 20, string? searchTerm = null, string? tags = null);
        
        /// <summary>
        /// Розширений пошук пінів з детальними параметрами
        /// </summary>
        /// <param name="searchTerm">Термін для пошуку (title, description)</param>
        /// <param name="searchInTitle">Шукати в заголовках</param>
        /// <param name="searchInDescription">Шукати в описах</param>
        /// <param name="exactMatch">Точний збіг (false = пошук по частинах)</param>
        /// <param name="pageNumber">Номер сторінки</param>
        /// <param name="pageSize">Розмір сторінки</param>
        /// <returns>Список знайдених пінів</returns>
        Task<PinListDto> SearchPinsAsync(
            string searchTerm,
            bool searchInTitle = true,
            bool searchInDescription = true, 
            bool exactMatch = false,
            int pageNumber = 1,
            int pageSize = 20);
        
        Task<PinListDto> GetUserPinsAsync(string userId, int pageNumber = 1, int pageSize = 20);
        Task<PinListDto> GetBoardPinsAsync(Guid boardId, int pageNumber = 1, int pageSize = 20);
        Task<PinResponseDto?> UpdatePinAsync(Guid pinId, UpdatePinDto updatePinDto, string userId);
        Task<bool> DeletePinAsync(Guid pinId, string userId);
        Task<bool> AddPinToBoardAsync(Guid pinId, Guid boardId, string userId);
        Task<bool> RemovePinFromBoardAsync(Guid pinId, Guid boardId, string userId);
    }
} 