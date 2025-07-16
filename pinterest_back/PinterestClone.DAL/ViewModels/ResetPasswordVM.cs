using System.ComponentModel.DataAnnotations;

namespace PinterestClone.DAL.ViewModels
{
    public class ResetPasswordVM
    {
        [Required(ErrorMessage = "Email обов'язковий")]
        [EmailAddress(ErrorMessage = "Невірний формат email")]
        public string Email { get; set; }
        
        [Required(ErrorMessage = "Код верифікації обов'язковий")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Код має бути 4-значним")]
        public string Code { get; set; }
        
        [Required(ErrorMessage = "Новий пароль обов'язковий")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Пароль має бути від 6 до 100 символів")]
        public string NewPassword { get; set; }
        
        [Required(ErrorMessage = "Підтвердження пароля обов'язкове")]
        [Compare("NewPassword", ErrorMessage = "Паролі не співпадають")]
        public string ConfirmPassword { get; set; }
    }
} 