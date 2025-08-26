using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using System;
using System.Threading.Tasks;

namespace PinterestClone.BLL.Services.PinViewHistoryService
{
    public interface IPinViewHistoryService
    {
        Task<ServiceResponse> AddPinViewAsync(string userId, AddPinViewDto addPinViewDto);
        Task<ServiceResponse> GetUserViewHistoryAsync(string userId, int page = 1, int pageSize = 50);
        Task<ServiceResponse> GetUserViewHistoryByDateAsync(string userId, DateTime date);
        Task<ServiceResponse> GetUserViewHistoryByDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
        Task<ServiceResponse> DeleteUserViewHistoryAsync(string userId);
        Task<ServiceResponse> HasUserViewedPinAsync(string userId, Guid pinId);
        Task<ServiceResponse> RemoveDuplicateViewsAsync(string userId);
    }
}
