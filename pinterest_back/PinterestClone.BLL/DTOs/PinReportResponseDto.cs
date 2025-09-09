namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для відповіді при роботі зі скаргами на піни.
    /// </summary>
    public class PinReportResponseDto
    {
        /// <summary>
        /// ID скарги.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID піна, на який поскаржилися.
        /// </summary>
        public string PinId { get; set; } = string.Empty;

        /// <summary>
        /// ID користувача, який поскаржився.
        /// </summary>
        public string ReportedByUserId { get; set; } = string.Empty;

        /// <summary>
        /// Нікнейм користувача, який поскаржився.
        /// </summary>
        public string ReportedByUserName { get; set; } = string.Empty;

        /// <summary>
        /// Повідомлення скарги.
        /// </summary>
        public string ReportMessage { get; set; } = string.Empty;

        /// <summary>
        /// Коли надійшла скарга.
        /// </summary>
        public DateTime ReportedAt { get; set; }

        /// <summary>
        /// Чи розглянута скарга.
        /// </summary>
        public bool IsResolved { get; set; }

        /// <summary>
        /// Коли вирішена скарга.
        /// </summary>
        public DateTime? ResolvedAt { get; set; }

        /// <summary>
        /// Деталі вирішення скарги.
        /// </summary>
        public string? ResolutionNotes { get; set; }

        /// <summary>
        /// Пін, на який поскаржилися.
        /// </summary>
        public PinResponseDto Pin { get; set; } = null!;
    }
} 
