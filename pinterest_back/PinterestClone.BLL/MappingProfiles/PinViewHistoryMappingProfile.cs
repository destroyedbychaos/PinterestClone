using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.MappingProfiles
{
    public class PinViewHistoryMappingProfile : Profile
    {
        public PinViewHistoryMappingProfile()
        {
            CreateMap<PinViewHistory, PinViewHistoryDto>()
                .ForMember(dest => dest.PinTitle, opt => opt.MapFrom(src => src.Pin.Title))
                .ForMember(dest => dest.PinImageUrl, opt => opt.MapFrom(src => src.Pin.ImageUrl))
                .ForMember(dest => dest.PinDescription, opt => opt.MapFrom(src => src.Pin.Description))
                .ForMember(dest => dest.PinAuthorName, opt => opt.MapFrom(src => src.Pin.User.DisplayName ?? src.Pin.User.UserName))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.PinId, opt => opt.MapFrom(src => src.PinId))
                .ForMember(dest => dest.ViewedAt, opt => opt.MapFrom(src => src.ViewedAt))
                .ForMember(dest => dest.Source, opt => opt.MapFrom(src => src.Source))
                .ForMember(dest => dest.IsCompleteView, opt => opt.MapFrom(src => src.IsCompleteView));
        }
    }
}
