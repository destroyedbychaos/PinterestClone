namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для списку пінів.
    /// </summary>
    public class PinListDto
    {
        /// <summary>
        /// Список пінів.
        /// </summary>
        public List<PinSimpleDto> Pins { get; set; } = [];

        /// <summary>
        /// Загальна кількість пінів у списку.
        /// </summary>
        public int TotalCount { get; set; } = 0;

        /// <summary>
        /// Номер сторінки для пагінації.
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// Розмір сторінки для пагінації.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Загальна кількість сторінок пінів у списку.
        /// </summary>
        public int TotalPages { get; set; }
    }
} 