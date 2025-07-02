using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;


namespace PinterestClone.DAL.Models.Identity
{
    public class User : IdentityUser
    {
        public string? DisplayName { get; set; } 
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }

        public DateTime BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? Country { get; set; }
        public string? Language { get; set; }

        public bool IsProfilePublic { get; set; } = true;

        public virtual ICollection<Board> Boards { get; set; }
        public virtual ICollection<Pin> Pins { get; set; } 
        public virtual ICollection<Comment> Comments { get; set; } 
        public virtual ICollection<Like> Likes { get; set; } 

        public virtual ICollection<UserClaim> Claims { get; set; }
        public virtual ICollection<UserLogin> Logins { get; set; }
        public virtual ICollection<UserToken> Tokens { get; set; }
    }
}
