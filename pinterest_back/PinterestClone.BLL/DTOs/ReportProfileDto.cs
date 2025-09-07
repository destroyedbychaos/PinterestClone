using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для скарги на профіль.
    /// </summary>
    public class ReportProfileDto
    {
        /// <summary>
        /// ID профілю користувача, на який поскаржилися.
        /// </summary>
        [Required]
        public string ProfileId { get; set; } = string.Empty;

        /// <summary>
        /// Причина скарги.
        /// </summary>
        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string ReportMessage { get; set; } = string.Empty;
    }
}
