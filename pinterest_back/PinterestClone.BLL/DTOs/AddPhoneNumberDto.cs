using System.ComponentModel.DataAnnotations;

namespace PinterestClone.BLL.DTOs
{
    public class AddPhoneNumberDto
    {
        [Required(ErrorMessage = "Номер телефону обов'язковий")]
        [Phone(ErrorMessage = "Неправильний формат номера телефона")]
        [StringLength(20, ErrorMessage = "Номер телефону не може бути довшим ніж 20 символів")]
        public string PhoneNumber { get; set; } = null!;
    }
} 