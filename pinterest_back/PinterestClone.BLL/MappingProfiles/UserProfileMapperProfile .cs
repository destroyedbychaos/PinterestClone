using AutoMapper;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.ViewModels;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace PinterestClone.BLL.MappingProfiles
{
    public class UserProfileMapperProfile : Profile
    {
        public UserProfileMapperProfile()
        {
            CreateMap<User, UserProfileDto>();
        }
    }
}
