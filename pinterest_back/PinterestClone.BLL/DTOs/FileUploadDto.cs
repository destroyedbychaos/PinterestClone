using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Модель для завантаження файлу.
    /// </summary>
    public class FileUploadDto
    {
        /// <summary>
        /// Файл зображення, який потрібно завантажити.
        /// </summary>
        public IFormFile File { get; set; }
    }
}
