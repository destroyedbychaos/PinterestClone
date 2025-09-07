using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.BLL.MappingProfiles
{
    /// <summary>
    /// Мапер для об'єктів пов'язаних з користувачами.
    /// ----------------------------------------------
    /// User -> UserProfileDto
    /// User -> UserSearchDto
    /// </summary>
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile() 
        {
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.FollowersCount,
                    opt => opt.MapFrom(src => src.Followers != null ? src.Followers.Count : 0))
                .ForMember(dest => dest.FollowingCount,
                    opt => opt.MapFrom(src => src.Following != null ? src.Following.Count : 0))
                .ReverseMap()
                .ForMember(dest => dest.Boards, opt => opt.Ignore())
                .ForMember(dest => dest.Pins, opt => opt.Ignore())
                .ForMember(dest => dest.Comments, opt => opt.Ignore())
                .ForMember(dest => dest.Likes, opt => opt.Ignore())
                .ForMember(dest => dest.Followers, opt => opt.Ignore())
                .ForMember(dest => dest.Following, opt => opt.Ignore())
                .ForMember(dest => dest.Claims, opt => opt.Ignore())
                .ForMember(dest => dest.Logins, opt => opt.Ignore())
                .ForMember(dest => dest.Tokens, opt => opt.Ignore());

            CreateMap<User, UserSearchDto>();
        }
    }
}
