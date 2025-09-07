using PinterestClone.DAL;
using PinterestClone.DAL.ViewModels;
using FluentValidation;

namespace PinterestClone.BLL.Validators
{
    /// <summary>
    /// Валідатор для входу в профіль.
    /// </summary>
    public class LoginValidator : AbstractValidator<LoginVM>
    {
        public LoginValidator() 
        {
            RuleFor(m => m.Email)
                .EmailAddress().WithMessage("Невірний формат пошти")
                .NotEmpty().WithMessage("Вкажіть пошту");
            RuleFor(m => m.Password)
                .MinimumLength(Settings.PasswordLength).WithMessage("Мінімальна довжина паролю 6 символів");
        }
    }
}
