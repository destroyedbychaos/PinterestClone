using FluentValidation;
using PinterestClone.DAL.ViewModels;

namespace PinterestClone.BLL.Validators
{
    /// <summary>
    /// Валідатор підтвердження коду скидання паролю.
    /// </summary>
    public class VerifyResetCodeValidator : AbstractValidator<VerifyResetCodeVM>
    {
        public VerifyResetCodeValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Невірний формат email")
                .MaximumLength(256).WithMessage("Email не може перевищувати 256 символів");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Код верифікації обов'язковий")
                .Length(4).WithMessage("Код має бути 4-значним")
                .Matches(@"^\d{4}$").WithMessage("Код має містити тільки цифри");
        }
    }
} 