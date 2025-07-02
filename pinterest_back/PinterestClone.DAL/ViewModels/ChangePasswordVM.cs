using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.DAL.ViewModels
{
    public class ChangePasswordVM
    {
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
