using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PinterestClone.BLL.Services;
using System.Text;
using System.Text.Json;

namespace PinterestClone.BLL.Services.SmsService
{
    public class SmsService : ISmsService
    {
        private readonly ILogger<SmsService> _logger;
        private readonly IConfiguration _configuration;
        private readonly Random _random;
        private readonly HttpClient _httpClient;

        public SmsService(ILogger<SmsService> logger, IConfiguration configuration, HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _random = new Random();
            _httpClient = httpClient;
        }

        public Task<ServiceResponse> GenerateVerificationCodeAsync()
        {
            try
            {
                var code = _random.Next(100000, 999999).ToString();
                _logger.LogInformation("Згенеровано код підтвердження для SMS");
                return Task.FromResult(ServiceResponse.OkResponse("Код підтвердження згенеровано", code));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка генерації коду підтвердження");
                return Task.FromResult(ServiceResponse.InternalServerErrorResponse("Помилка генерації коду підтвердження"));
            }
        }

        public async Task<ServiceResponse> SendVerificationCodeAsync(string phoneNumber, string code)
        {
            try
            {
                var message = $"Ваш код підтвердження для Pinterest: {code}. Код діє 10 хвилин.";
                return await SendSmsAsync(phoneNumber, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка відправки коду підтвердження на {PhoneNumber}", phoneNumber);
                return ServiceResponse.InternalServerErrorResponse("Помилка відправки коду підтвердження");
            }
        }

        public async Task<ServiceResponse> SendNotificationAsync(string phoneNumber, string message)
        {
            try
            {
                var fullMessage = $"Pinterest: {message}";
                return await SendSmsAsync(phoneNumber, fullMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка відправки сповіщення на {PhoneNumber}", phoneNumber);
                return ServiceResponse.InternalServerErrorResponse("Помилка відправки сповіщення");
            }
        }

        private async Task<ServiceResponse> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var isDevelopmentString = _configuration["Development:DisableSms"];
                var isDevelopment = !string.IsNullOrEmpty(isDevelopmentString) && bool.Parse(isDevelopmentString);
                if (isDevelopment)
                {
                    _logger.LogInformation("SMS на {PhoneNumber}: {Message}", phoneNumber, message);
                    return ServiceResponse.OkResponse("SMS відправлено (режим розробки)", true);
                }
                return await SendViaVonageAsync(phoneNumber, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка відправки SMS на {PhoneNumber}", phoneNumber);
                return ServiceResponse.InternalServerErrorResponse("Помилка відправки SMS");
            }
        }

        private async Task<ServiceResponse> SendViaVonageAsync(string phoneNumber, string message)
        {
            try
            {
                var apiKey = _configuration["Vonage:ApiKey"];
                var apiSecret = _configuration["Vonage:ApiSecret"];
                var fromNumber = _configuration["Vonage:FromNumber"] ?? "Pinterest";

                if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
                {
                    _logger.LogWarning("Облікові дані Vonage не налаштовані, відправка SMS вимкнена");
                    return ServiceResponse.BadRequestResponse("SMS сервіс не налаштований");
                }

                var normalizedPhone = NormalizePhoneNumber(phoneNumber);

                var requestData = new
                {
                    api_key = apiKey,
                    api_secret = apiSecret,
                    to = normalizedPhone,
                    from = fromNumber,
                    text = message
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("Відправка SMS через Vonage на {PhoneNumber}", normalizedPhone);

                var response = await _httpClient.PostAsync("https://rest.nexmo.com/sms/json", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Відповідь Vonage: {Response}", responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = JsonSerializer.Deserialize<VonageResponse>(responseContent);
                    if (jsonResponse?.messages != null && jsonResponse.messages.Length > 0)
                    {
                        var firstMessage = jsonResponse.messages[0];
                        if (firstMessage.status == "0")
                        {
                            _logger.LogInformation("SMS успішно відправлено на {PhoneNumber} через Vonage, MessageId: {MessageId}",
                                normalizedPhone, firstMessage.messageId);
                            return ServiceResponse.OkResponse("SMS успішно відправлено", firstMessage.messageId);
                        }
                        else
                        {
                            _logger.LogError("Vonage повернула помилку: Статус {Status}, Помилка: {Error}",
                                firstMessage.status, firstMessage.errorText);
                            return ServiceResponse.BadRequestResponse($"Помилка Vonage: {firstMessage.errorText ?? "Невідома помилка"}");
                        }
                    }
                    else
                    {
                        _logger.LogError("Vonage повернула неочікуваний формат відповіді");
                        return ServiceResponse.BadRequestResponse("Неочікувана відповідь від SMS сервісу");
                    }
                }
                else
                {
                    _logger.LogError("HTTP помилка Vonage: {StatusCode}, Контент: {Content}", response.StatusCode, responseContent);
                    return ServiceResponse.InternalServerErrorResponse("Помилка зв'язку з SMS сервісом");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка відправки SMS через Vonage на {PhoneNumber}", phoneNumber);
                return ServiceResponse.InternalServerErrorResponse("Помилка відправки SMS");
            }
        }

        private static string NormalizePhoneNumber(string phoneNumber)
        {
            var digitsOnly = new string(phoneNumber.Where(char.IsDigit).ToArray());
            if (digitsOnly.StartsWith("380"))
            {
                return digitsOnly;
            }
            if (digitsOnly.StartsWith("0"))
            {
                return "380" + digitsOnly.Substring(1);
            }
            if (digitsOnly.Length == 9)
            {
                return "380" + digitsOnly;
            }
            return digitsOnly;
        }

        private class VonageResponse
        {
            public int messageCount { get; set; }
            public VonageMessage[]? messages { get; set; }
        }

        private class VonageMessage
        {
            public string? to { get; set; }
            public string? messageId { get; set; }
            public string? status { get; set; }
            public string? remainingBalance { get; set; }
            public string? messagePrice { get; set; }
            public string? network { get; set; }
            public string? errorText { get; set; }
        }
    }
} 