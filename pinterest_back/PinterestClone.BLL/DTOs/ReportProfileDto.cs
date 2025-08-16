using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class ReportProfileDto
    {
        [Required]
        public string ProfileId { get; set; } = string.Empty;

        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string ReportMessage { get; set; } = string.Empty;
    }
}
