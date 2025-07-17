using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.ViewModels
{
    public class VerifyResetCodeVM
    {
        [Required(ErrorMessage = "Email обов'язковий")]
        [EmailAddress(ErrorMessage = "Невірний формат email")]
        public required string Email { get; set; }
        
        [Required(ErrorMessage = "Код верифікації обов'язковий")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Код має бути 4-значним")]
        public required string Code { get; set; }
    }
} 