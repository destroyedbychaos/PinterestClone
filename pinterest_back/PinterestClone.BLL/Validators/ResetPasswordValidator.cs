using FluentValidation;
using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Validators
{
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordVM>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Невірний формат email")
                .MaximumLength(256).WithMessage("Email не може перевищувати 256 символів");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Код верифікації обов'язковий")
                .Length(4).WithMessage("Код має бути 4-значним")
                .Matches(@"^\d{4}$").WithMessage("Код має містити тільки цифри");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Новий пароль обов'язковий")
                .MinimumLength(6).WithMessage("Пароль має бути не менше 6 символів")
                .MaximumLength(100).WithMessage("Пароль не може перевищувати 100 символів")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$")
                .WithMessage("Пароль має містити хоча б одну велику літеру, одну малу літеру та одну цифру");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Підтвердження пароля обов'язкове")
                .Equal(x => x.NewPassword).WithMessage("Паролі не співпадають");
        }
    }
} 