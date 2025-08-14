using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.BLL.MappingProfiles
{
    public class DeviceServicesMappingProfile : Profile
    {
        public DeviceServicesMappingProfile() 
        {
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.Message))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ReverseMap()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Title, opt => opt.Ignore())
                .ForMember(dest => dest.ScheduledAt, opt => opt.Ignore())
                .ForMember(dest => dest.SentAt, opt => opt.Ignore())
                .ForMember(dest => dest.ErrorMessage, opt => opt.Ignore())
                .ForMember(dest => dest.IsSmsEnabled, opt => opt.Ignore())
                .ForMember(dest => dest.IsEmailEnabled, opt => opt.Ignore())
                .ForMember(dest => dest.IsInAppEnabled, opt => opt.Ignore())
                .ForMember(dest => dest.PinId, opt => opt.Ignore())
                .ForMember(dest => dest.BoardId, opt => opt.Ignore())
                .ForMember(dest => dest.CommentId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Pin, opt => opt.Ignore())
                .ForMember(dest => dest.Board, opt => opt.Ignore())
                .ForMember(dest => dest.Comment, opt => opt.Ignore());

            CreateMap<User, UserProfileDto>()
                .ReverseMap()
                .ForMember(dest => dest.Boards, opt => opt.Ignore())
                .ForMember(dest => dest.Pins, opt => opt.Ignore())
                .ForMember(dest => dest.Comments, opt => opt.Ignore())
                .ForMember(dest => dest.Likes, opt => opt.Ignore())
                .ForMember(dest => dest.Claims, opt => opt.Ignore())
                .ForMember(dest => dest.Logins, opt => opt.Ignore())
                .ForMember(dest => dest.Tokens, opt => opt.Ignore());
        }
    }
}
