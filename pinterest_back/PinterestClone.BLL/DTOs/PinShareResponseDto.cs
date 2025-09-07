namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для відповіді при роботі з поширення ми пінів.
    /// </summary>
    public class PinShareResponseDto
    {
        /// <summary>
        /// ID поширення.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID поширеного піна.
        /// </summary>
        public string PinId { get; set; } = string.Empty;

        /// <summary>
        /// ID користувача, який поширив пін.
        /// </summary>
        public string SharedByUserId { get; set; } = string.Empty;

        /// <summary>
        /// Нікнейм користувача, який поширив пін.
        /// </summary>
        public string SharedByUserName { get; set; } = string.Empty;

        /// <summary>
        /// ID користувача, з яким поширено.
        /// </summary>
        public string SharedWithUserId { get; set; } = string.Empty;

        /// <summary>
        /// Нікнейм користувача, з яким поширено.
        /// </summary>
        public string SharedWithUserName { get; set; } = string.Empty;

        /// <summary>
        /// Повідомлення з поширенням.
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Коли поширено пін.
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// Чи поширення було прочитано.
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// Коли поширення було прочитано.
        /// </summary>
        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// Пін, який поширено.
        /// </summary>
        public PinResponseDto Pin { get; set; } = null!;
    }
}