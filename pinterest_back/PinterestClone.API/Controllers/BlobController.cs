using Emgu.CV;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.FileBlobService;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Контролер відповідальний за операції з Azure Blob.
    /// --------------------------------------------------
    /// Методи:
    ///     -- Отримати список усіх файлів
    ///     -- Завантажити новий файл у блоб-сховище
    ///     -- Завантажити файл з блоб-сховища
    ///     -- Видаляє блоб-файл зі сховища
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class BlobController : BaseController
    {
        private readonly IFileService _fileService;
        public BlobController(IFileService fileService)
        {
            _fileService = fileService;
        }

        /// <summary>
        /// Отримує список усіх блоб-файлів, збережених у системі.
        /// </summary>
        /// <returns><see cref="IActionResult"/>, що містить колекцію блоб-об’єктів.</returns>
        [HttpGet]
        public async Task<IActionResult> ListAllBlobs()
        {
            var result = await _fileService.GetAllBlobsAsync();

            return Ok(result);
        }

        /// <summary>
        /// Завантажує новий файл у блоб-сховище.
        /// </summary>
        /// <param name="file"><see cref="IFormFile"/> файл для завантаження.</param>
        /// <returns><see cref="IActionResult"/>, що містить результат завантаження та інформацію про блоб.</returns>
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobResponseDto result = await _fileService.UploadAsync(file, Guid.NewGuid().ToString());

            if (result.Error == true)
            {
                return BadRequest(result.Status);
            }

            return Ok(result);
        }

        /// <summary>
        /// Завантажує блоб-файл з системи за його назвою.
        /// </summary>
        /// <param name="filename">Назва файлу <see cref="string"/>, який потрібно завантажити.</param>
        /// <returns><see cref="IActionResult"/>, що містить файл у вигляді потоку з його вмістом, типом та ім’ям.</returns>
        [HttpGet]
        [Route("filename")]
        public async Task<IActionResult> Download(string filename)
        {
            if (filename == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobDto result = await _fileService.DownloadAsync(filename);

            if (result == null)
            {
                return BadRequest("Error downloading file. File does not exist.");
            }

            return File(result.Content, result.ContentType, result.Name);
        }

        /// <summary>
        /// Видаляє блоб-файл зі сховища за його назвою.
        /// </summary>
        /// <param name="filename"> Назва файлу <see cref="string"/> який потрібно видалити.</param>
        /// <returns><see cref="IActionResult"/>, що містить статус виконання операції видалення.</returns>
        [HttpDelete]
        [Route("filename")]
        public async Task<IActionResult> Delete(string filename)
        {
            if (filename == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobResponseDto result = await _fileService.DeleteAsync(filename);

            if (result.Error == true)
            {
                return BadRequest(result.Status);
            }

            return Ok(result.Status);
        }
    }
}