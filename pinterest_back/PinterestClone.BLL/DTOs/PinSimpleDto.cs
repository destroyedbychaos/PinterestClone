using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для певного піна.
    /// </summary>
    public class PinSimpleDto
    {
        /// <summary>
        /// ID піна.
        /// </summary>
        public required string Id { get; set; }

        /// <summary>
        /// Назва піна.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Опис піна.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Посилання на картинку.
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// Теги піна.
        /// </summary>
        public string? Tags { get; set; }

        /// <summary>
        /// Коли створено пін.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Нікнейм власника піна.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Кількість лайків.
        /// </summary>
        public int LikesCount { get; set; } = 0;

        /// <summary>
        /// Кількість коментарів.
        /// </summary>
        public int CommentsCount { get; set; } = 0;
    }
}
