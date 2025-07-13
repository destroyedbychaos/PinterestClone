namespace PinterestClone.BLL.Services.EmailService
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body);
        Task<bool> SendPinReportEmailAsync(string pinId, string pinTitle, string reportedByUser, string reportMessage);
    }
} 