using PinterestClone.DAL.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Models
{
    public class Pin
    {
        public required Guid Id { get; set; } = Guid.NewGuid();
        public required string Title { get; set; } 
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Link { get; set; }
        
        
        //public required string ImageFileName { get; set; }
        //public required string ImageHash { get; set; } 
        //public long ImageSize { get; set; } 
        //public required string ImageContentType { get; set; } 
        
        public string? Tags { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public required string UserId { get; set; } 
        public virtual User? User { get; set; } 

        public virtual ICollection<BoardPin> BoardPins { get; set; } = [];
        public virtual ICollection<Like> Likes { get; set; } = [];
        public virtual ICollection<Comment> Comments { get; set; } = [];
    }

}
