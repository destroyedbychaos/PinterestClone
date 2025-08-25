using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.ViewModels
{
    public class UpdateSettingsVM
    {
        [EmailAddress]
        public string? Email { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        [StringLength(100)]
        public string? DisplayName { get; set; }

        [StringLength(100)]
        public string? UserName { get; set; }

        [StringLength(500)]
        public string? Bio { get; set; }

        public DateTime? BirthDate { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        public bool? IsProfilePublic { get; set; }
    }
}
