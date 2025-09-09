using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class UserSearchDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsFollowing { get; set; }
        public List<string> Interests { get; set; } = new();
        public List<string> Vibes { get; set; } = new();
    }
}
