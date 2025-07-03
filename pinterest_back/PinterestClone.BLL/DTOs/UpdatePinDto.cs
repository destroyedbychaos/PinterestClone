using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class UpdatePinDto
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }


        [Url]
        public string? Link { get; set; }

        public string? Tags { get; set; }
    }
} 