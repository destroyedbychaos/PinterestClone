using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace PinterestClone.BLL.Services.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpServer = _configuration["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
                var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
                var fromEmail = _configuration["EmailSettings:FromEmail"];
                var fromName = _configuration["EmailSettings:FromName"];

                if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpUsername) || 
                    string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(fromEmail))
                {
                
                    Console.WriteLine($"Email would be sent to {to}: {subject}");
                    Console.WriteLine($"Body: {body}");
                    return true;
                }

                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword)
                };

                var message = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                message.To.Add(to);

                await client.SendMailAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendPinReportEmailAsync(string pinId, string pinTitle, string reportedByUser, string reportMessage)
        {
            var supportEmail = _configuration["EmailSettings:SupportEmail"] ?? "supporrrttt138532@gmail.com";
            var subject = $"Нова скарга на пін: {pinTitle}";
            
            var body = $@"
                <h2>Нова скарга на пін</h2>
                <p><strong>ID піна:</strong> {pinId}</p>
                <p><strong>Назва піна:</strong> {pinTitle}</p>
                <p><strong>Скаргу подав:</strong> {reportedByUser}</p>
                <p><strong>Час скарги:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                <hr>
                <h3>Текст скарги:</h3>
                <p>{reportMessage}</p>
                <hr>
                <p><em>Це автоматичне повідомлення з Pinterest Clone</em></p>";

            return await SendEmailAsync(supportEmail, subject, body);
        }
    }
} 