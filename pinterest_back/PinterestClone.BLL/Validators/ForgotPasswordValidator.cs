using FluentValidation;
using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Validators
{
    public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordVM>
    {
        public ForgotPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Невірний формат email")
                .MaximumLength(256).WithMessage("Email не може перевищувати 256 символів");
        }
    }
} 