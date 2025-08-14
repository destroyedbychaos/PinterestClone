using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Models
{
    public class UserFollow
    {
        public string FollowerId { get; set; }
        public User Follower { get; set; } = null!;

        public string FollowingId { get; set; }
        public User Following { get; set; } = null!;
    }
}
