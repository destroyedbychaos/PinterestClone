using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class OnboardingDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Language { get; set; } = string.Empty;

        [Required]
        [MinLength(1, ErrorMessage = "At least one interest must be selected")]
        public List<string> Interests { get; set; } = new();

        [Required]
        [MinLength(3, ErrorMessage = "At least three vibes must be selected")]
        public List<string> Vibes { get; set; } = new();
    }
}
