using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services;
using PinterestClone.BLL.Services.PinViewHistoryService;
using PinterestClone.DAL.Repositories.PinViewHistoryRepository;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PinterestClone.BLL.Services.PinViewHistoryService
{
    public class PinViewHistoryService : IPinViewHistoryService
    {
        private readonly IPinViewHistoryRepository _pinViewHistoryRepository;
        private readonly IMapper _mapper;

        public PinViewHistoryService(
            IPinViewHistoryRepository pinViewHistoryRepository,
            IMapper mapper)
        {
            _pinViewHistoryRepository = pinViewHistoryRepository;
            _mapper = mapper;
        }

        public async Task<ServiceResponse> AddPinViewAsync(string userId, AddPinViewDto addPinViewDto)
        {
            try
            {
                var hasViewed = await _pinViewHistoryRepository.HasUserViewedPinAsync(userId, addPinViewDto.PinId);
                
                if (hasViewed)
                {
                    
                    return ServiceResponse.OkResponse("Pin already in history, skipping", null);
                }
                else
                {
                    
                    var pinViewHistory = new PinterestClone.DAL.Models.PinViewHistory
                    {
                        Id = Guid.NewGuid(),
                        PinId = addPinViewDto.PinId,
                        UserId = userId,
                        ViewedAt = DateTime.UtcNow,
                        UserAgent = addPinViewDto.UserAgent,
                        IpAddress = addPinViewDto.IpAddress,
                        Source = addPinViewDto.Source,
                        ViewDuration = addPinViewDto.ViewDuration ?? 0,
                        IsCompleteView = addPinViewDto.IsCompleteView
                    };

                    var result = await _pinViewHistoryRepository.AddAsync(pinViewHistory);
                    var dto = _mapper.Map<PinViewHistoryDto>(result);
                    return ServiceResponse.OkResponse("Pin view recorded successfully", dto);
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error recording pin view: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetUserViewHistoryAsync(string userId, int page = 1, int pageSize = 50)
        {
            try
            {
                var views = await _pinViewHistoryRepository.GetUserViewHistoryAsync(userId, page, pageSize);
                var totalCount = await _pinViewHistoryRepository.GetUserViewHistoryCountAsync(userId);

                var viewDtos = views.Select(v => _mapper.Map<PinViewHistoryDto>(v)).ToList();

                var response = new PinViewHistoryResponse
                {
                    Views = viewDtos,
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ServiceResponse.OkResponse("View history retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error retrieving view history: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetUserViewHistoryByDateAsync(string userId, DateTime date)
        {
            try
            {
                var views = await _pinViewHistoryRepository.GetUserViewHistoryByDateAsync(userId, date);
                var viewDtos = views.Select(v => _mapper.Map<PinViewHistoryDto>(v)).ToList();

                var response = new PinViewHistoryResponse
                {
                    Views = viewDtos,
                    TotalCount = viewDtos.Count,
                    PageNumber = 1,
                    PageSize = viewDtos.Count,
                    TotalPages = 1
                };

                return ServiceResponse.OkResponse("View history by date retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error retrieving view history by date: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> GetUserViewHistoryByDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var views = await _pinViewHistoryRepository.GetUserViewHistoryByDateRangeAsync(userId, startDate, endDate);
                var viewDtos = views.Select(v => _mapper.Map<PinViewHistoryDto>(v)).ToList();

                var response = new PinViewHistoryResponse
                {
                    Views = viewDtos,
                    TotalCount = viewDtos.Count,
                    PageNumber = 1,
                    PageSize = viewDtos.Count,
                    TotalPages = 1
                };

                return ServiceResponse.OkResponse("View history by date range retrieved successfully", response);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error retrieving view history by date range: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> DeleteUserViewHistoryAsync(string userId)
        {
            try
            {
                await _pinViewHistoryRepository.DeleteUserViewHistoryAsync(userId);
                return ServiceResponse.OkResponse("User view history deleted successfully", true);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error deleting user view history: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> HasUserViewedPinAsync(string userId, Guid pinId)
        {
            try
            {
                var hasViewed = await _pinViewHistoryRepository.HasUserViewedPinAsync(userId, pinId);
                return ServiceResponse.OkResponse("Pin view status checked successfully", hasViewed);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error checking pin view status: {ex.Message}");
            }
        }

        public async Task<ServiceResponse> RemoveDuplicateViewsAsync(string userId)
        {
            try
            {
                await _pinViewHistoryRepository.RemoveDuplicateViewsAsync(userId);
                return ServiceResponse.OkResponse("Duplicate views removed successfully", true);
            }
            catch (Exception ex)
            {
                return ServiceResponse.BadRequestResponse($"Error removing duplicate views: {ex.Message}");
            }
        }
    }
}
