using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для відповіді при роботі з дошками.
    /// </summary>
    public class BoardResponseDto
    {
        /// <summary>
        /// ID дошки.
        /// </summary>
        public required string Id { get; set; }

        /// <summary>
        /// Назва дошки.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Опис дошки.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Чи дошка приватна.
        /// </summary>
        public bool IsPrivate { get; set; }

        /// <summary>
        /// Чи дошка архівована.
        /// </summary>
        public bool IsArchived { get; set; } = false;


        /// <summary>
        /// Коли дошка була створена.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Коли дошка була востаннє змінена.
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// ID власника дошки.
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Нікнейм власника дошки.
        /// </summary>
        public string? UserName { get; set; }

        /// <summary>
        /// Піни на дошці.
        /// </summary>
        public List<PinSimpleDto> Pins { get; set; } = [];

        /// <summary>
        /// Кількість пінів на дошці.
        /// </summary>
        public int PinCount => Pins.Count;
    }
}
