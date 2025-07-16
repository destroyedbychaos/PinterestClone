using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.ViewModels
{
    public class ForgotPasswordVM
    {
        [Required(ErrorMessage = "Email обов'язковий")]
        [EmailAddress(ErrorMessage = "Невірний формат email")]
        public string Email { get; set; }
    }
} 