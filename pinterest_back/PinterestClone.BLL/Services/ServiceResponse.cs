using Microsoft.AspNetCore.Identity;
using System.Net;

namespace PinterestClone.BLL.Services
{
    /// <summary>
    /// Клас для повернення результатів сервісних методів.
    /// </summary>
    public class ServiceResponse
    {
        /// <summary>
        /// Повідомлення про результат виконання операції.
        /// </summary>
        public required string Message { get; set; }

        /// <summary>
        /// Позначає успішність операції.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Дані, які можуть бути повернені разом із відповіддю.
        /// </summary>
        public object? Payload { get; set; }

        /// <summary>
        /// HTTP статус відповіді.
        /// </summary>
        public HttpStatusCode StatusCode { get; set; }

        /// <summary>
        /// Внутрішній метод для створення екземпляру <see cref="ServiceResponse"/>.
        /// </summary>
        /// <returns><see cref="ServiceResponse"/>.</returns>
        private static ServiceResponse GetResponse(string message, bool success, object? payload, HttpStatusCode statusCode)
        {
            return new ServiceResponse
            {
                Message = message,
                Success = success,
                Payload = payload,
                StatusCode = statusCode
            };
        }

        /// <summary>
        /// Створює успішну відповідь.
        /// </summary>
        /// <returns><see cref="ServiceResponse"/> зі статусом 200 ОК.</returns>
        public static ServiceResponse OkResponse(string message, object? payload = null)
        {
            return GetResponse(message, true, payload, HttpStatusCode.OK);
        }

        /// <summary>
        /// Створює відповідь з помилкою клієнта.
        /// </summary>
        /// <returns><see cref="ServiceResponse"/> зі статусом 400 Bad Request.</returns>
        public static ServiceResponse BadRequestResponse(string message, object? payload = null)
        {
            return GetResponse(message, false, payload, HttpStatusCode.BadRequest);
        }

        /// <summary>
        /// Створює відповідь з внутрішньою помилкою сервера.
        /// </summary>
        /// <returns><see cref="ServiceResponse"/> зі статусом 500 Internal Server Error.</returns>
        public static ServiceResponse InternalServerErrorResponse(string message, object? payload = null)
        {
            return GetResponse(message, false, payload, HttpStatusCode.InternalServerError);
        }

        /// <summary>
        /// Створює відповідь на основі результату <see cref="IdentityResult"/>.
        /// </summary>
        /// <param name="result">Результат операції Identity.</param>
        /// <param name="successMessage">Повідомлення у випадку успіху.</param>
        /// <returns>Екземпляр <see cref="ServiceResponse"/>. 
        /// Якщо операція успішна — повертає OkResponse, інакше BadRequestResponse з помилкою.
        /// </returns>
        public static ServiceResponse ByIdentityResult(IdentityResult result, string successMessage)
        {
            return result.Succeeded 
                ? OkResponse(successMessage)
                : BadRequestResponse(result.Errors.First().Description);
        }
    }
}
