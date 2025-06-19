using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.Models
{
    public class BoardPin
    {
        public Guid BoardId { get; set; }
        public Board? Board { get; set; } 

        public Guid PinId { get; set; }
        public Pin? Pin { get; set; }
    }

}
