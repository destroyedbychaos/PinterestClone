using PinterestClone.DAL;
using PinterestClone.DAL.ViewModels;
using FluentValidation;

namespace PinterestClone.BLL.Validators
{
    public class RegisterValidator : AbstractValidator<RegisterVM>
    {
        public RegisterValidator() 
        {
            RuleFor(m => m.Email)
                .EmailAddress().WithMessage("Невірний формат пошти")
                .NotEmpty().WithMessage("Вкажіть пошту");
            RuleFor(m => m.Password)
                .MinimumLength(Settings.PasswordLength).WithMessage("Мінімальна довжина паролю 6 символів");
        }
    }
}
