using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.MappingProfiles
{
    public class PinMappingProfile : Profile
    {
        public PinMappingProfile()
        {
            CreateMap<Pin, PinSimpleDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl ?? ""))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : ""))
                .ForMember(dest => dest.LikesCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count))
                .ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Likes, opt => opt.Ignore())
                .ForMember(dest => dest.Comments, opt => opt.Ignore());

            CreateMap<Pin, PinRecommendationDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl ?? ""))
                .ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<UpdatePinDto, Pin>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                    string.IsNullOrWhiteSpace(src.Tags) ? null :
                    string.Join(",",
                        src.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(t => t.Trim().ToLower())
                            .Where(t => !string.IsNullOrWhiteSpace(t))
                    )
                ))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

            CreateMap<Pin, PinResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl ?? ""))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : ""))
                .ForMember(dest => dest.Boards, opt => opt.MapFrom(src => src.BoardPins.Select(bp => new BoardSimpleDto
                    {
                        Id = bp.Board != null ? bp.Board.Id.ToString() : "",
                        Name = bp.Board != null ? bp.Board.Name : ""
                    }).ToList()))
                .ForMember(dest => dest.LikesCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count));

            CreateMap<PinReport, PinReportResponseDto>()
                .ForMember(dest => dest.PinId, opt => opt.MapFrom(src => src.PinId.ToString()))
                .ForMember(dest => dest.ReportedByUserName, opt => opt.MapFrom(src => src.ReportedByUser.DisplayName ?? src.ReportedByUser.UserName ?? "Unknown"))
                .ForMember(dest => dest.Pin, opt => opt.MapFrom(src => src.Pin))
                .ReverseMap()
                .ForMember(dest => dest.PinId, opt => opt.MapFrom(src => Guid.Parse(src.PinId)))
                .ForMember(dest => dest.ReportedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Pin, opt => opt.Ignore());

            CreateMap<PinShare, PinShareResponseDto>()
                .ForMember(dest => dest.PinId, opt => opt.MapFrom(src => src.PinId.ToString()))
                .ForMember(dest => dest.SharedByUserName, opt => opt.MapFrom(src => src.SharedByUser.DisplayName ?? src.SharedByUser.UserName ?? "Unknown"))
                .ForMember(dest => dest.SharedWithUserName, opt => opt.MapFrom(src => src.SharedWithUser.DisplayName ?? src.SharedWithUser.UserName ?? "Unknown"))
                .ForMember(dest => dest.Pin, opt => opt.MapFrom(src => src.Pin))
                .ReverseMap()
                .ForMember(dest => dest.PinId, opt => opt.MapFrom(src => Guid.Parse(src.PinId)))
                .ForMember(dest => dest.SharedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.SharedWithUser, opt => opt.Ignore())
                .ForMember(dest => dest.Pin, opt => opt.Ignore());
        }
    }
}
