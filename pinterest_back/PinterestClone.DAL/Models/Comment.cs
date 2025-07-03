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
        public required Guid Id { get; set; } = Guid.NewGuid();
        public required string Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public required Guid PinId { get; set; }
        public Pin? Pin { get; set; } 

        public required string UserId { get; set; } 
        public User? User { get; set; } 
    }

}
