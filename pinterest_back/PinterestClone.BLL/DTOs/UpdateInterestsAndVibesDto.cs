using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// DTO для оновлення інтересів та vibes користувача.
    /// </summary>
    public class UpdateInterestsAndVibesDto
    {
        /// <summary>
        /// Список інтересів користувача.
        /// </summary>
        public List<string>? Interests { get; set; }

        /// <summary>
        /// Список vibes користувача (характерні риси/настрої).
        /// </summary>
        public List<string>? Vibes { get; set; }
    }
}
