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
    public class BoardMappingProfile : Profile
    {
        public BoardMappingProfile() 
        {
            CreateMap<Board, BoardResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : ""))
                .ForMember(dest => dest.Pins, opt => opt.MapFrom(src => src.BoardPins
                    .Where(bp => bp.Pin != null)
                    .OrderByDescending(bp => bp.Pin!.CreatedAt)
                    .Select(bp => bp.Pin)))
                .ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.BoardPins, opt => opt.Ignore());

            CreateMap<Board, BoardSimpleDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ReverseMap()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.BoardPins, opt => opt.Ignore());

        }
    }
}
