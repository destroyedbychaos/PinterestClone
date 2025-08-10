using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.ViewModels
{
    public class UpdateProfileVM
    {
        public string? UserName { get; set; }
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Country { get; set; }
        public string? Language { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }
    }
}
