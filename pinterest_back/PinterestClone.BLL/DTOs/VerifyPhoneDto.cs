using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class VerifyPhoneDto
    {
        [Required(ErrorMessage = "Код підтвердження обов'язковий")]
        [StringLength(6, MinimumLength = 4, ErrorMessage = "Код підтвердження має містити від 4 до 6 символів")]
        [RegularExpression(@"^\d+$", ErrorMessage = "Код підтвердження має містити тільки цифри")]
        public string VerificationCode { get; set; } = null!;

        [Required(ErrorMessage = "Номер телефону обов'язковий")]
        [Phone(ErrorMessage = "Неправильний формат номера телефону")]
        public string PhoneNumber { get; set; } = null!;
    }
} 
