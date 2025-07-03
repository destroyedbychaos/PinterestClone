using PinterestClone.DAL.Models.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Models
{
    public class Board
    {
        public required Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public string? Description { get; set; }
        public bool IsPrivate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public required string UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual ICollection<BoardPin> BoardPins { get; set; } = [];
    }

}
