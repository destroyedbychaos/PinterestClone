using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для створення нового коментаря.
    /// </summary>
    public class CreateCommentDto
    {
        /// <summary>
        /// ID піну, до якого додається коментар.
        /// </summary>
        public Guid PinId { get; set; }

        /// <summary>
        /// Текст нового коментаря.
        /// </summary>
        public string Content { get; set; } = string.Empty;
    }
}
