using PinterestClone.DAL.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Models
{
    public class Comment
    {
        public Guid Id { get; set; }
        public string? Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid PinId { get; set; }
        public Pin? Pin { get; set; } 

        public string? UserId { get; set; } 
        public User? User { get; set; } 
    }

}
