namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для відповіді при роботі з пінами.
    /// </summary>
    public class PinResponseDto
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
        /// Посилання на пін.
        /// </summary>
        public string? Link { get; set; }

        /// <summary>
        /// Теги піна.
        /// </summary>
        public string? Tags { get; set; }

        /// <summary>
        /// Коли створено пін.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// ID власника піна.
        /// </summary>
        public string UserId { get; set; } = string.Empty;
    
        /// <summary>
        /// Нікнейм власника піна.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Дошки, на яких є пін.
        /// </summary>
        public List<BoardSimpleDto> Boards { get; set; } = [];

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