using PinterestClone.DAL.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Models
{
    public class Like
    {
        public Guid Id { get; set; }

        public Guid PinId { get; set; }
        public virtual Pin? Pin { get; set; }

        public required string UserId { get; set; }
        public virtual User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
