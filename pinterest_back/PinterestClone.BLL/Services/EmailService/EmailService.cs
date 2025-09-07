using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace PinterestClone.BLL.Services.EmailService
{
    /// <summary>
    /// Сервіс відповідальний за дії з електронними листами.
    /// ----------------------------------------------------
    /// Методи:
    ///     -- Надіслати емейл користувачу
    ///     -- Надіслати емейл про скаргу на аест
    ///     -- Надіслати емейл про скаргу на профіль
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Надсилає електронний лист на вказану адресу.
        /// </summary>
        /// <param name="to">Адреса отримувача.</param>
        /// <param name="subject">Тема листа.</param>
        /// <param name="body">Тіло листа (HTML або текст).</param>
        /// <returns>
        /// <c>true</c>, якщо лист успішно надіслано або змодельовано; 
        /// <c>false</c>, якщо сталася помилка.
        /// </returns>
        /// <exception cref="SmtpException">Виникає у випадку проблем з SMTP-сервером.</exception>
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


        /// <summary>
        /// Надсилає емейл до служби підтримки про скаргу на пін.
        /// </summary>
        /// <param name="pinId">Ідентифікатор піна.</param>
        /// <param name="pinTitle">Назва піна.</param>
        /// <param name="reportedByUser">Ім’я або email користувача, який подав скаргу.</param>
        /// <param name="reportMessage">Текст скарги.</param>
        /// <returns><c>True</c>, якщо лист успішно надіслано; інакше <c>False</c>.</returns>
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

        public async Task<bool> SendProfileReportEmailAsync(string profileId, string profileUsername, string reportedByUser, string reportMessage)
        {
            var supportEmail = _configuration["EmailSettings:SupportEmail"] ?? "supporrrttt138532@gmail.com";
            var subject = $"Нова скарга на профіль: {profileUsername}";
            
            var body = $@"
                <h2>Нова скарга на профіль</h2>
                <p><strong>ID профілю:</strong> {profileId}</p>
                <p><strong>Username профілю:</strong> {profileUsername}</p>
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