using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.HiddenPinRepository
{
    public interface IHiddenPinRepository
    {
        Task<HiddenPin?> GetByPinAndUserAsync(Guid pinId, string userId);
        Task<HiddenPin> CreateAsync(HiddenPin hiddenPin);
        Task<bool> DeleteAsync(int id);
        Task<bool> DeleteByPinAndUserAsync(Guid pinId, string userId);
        Task<IEnumerable<Guid>> GetHiddenPinIdsForUserAsync(string userId);
    }
} 