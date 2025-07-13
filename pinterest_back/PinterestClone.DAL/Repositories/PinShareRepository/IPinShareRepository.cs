using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PinShareRepository
{
    public interface IPinShareRepository
    {
        Task<PinShare?> GetByIdAsync(int id);
        Task<PinShare> CreateAsync(PinShare pinShare);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<int> GetUnreadCountAsync(string userId);
    }
}