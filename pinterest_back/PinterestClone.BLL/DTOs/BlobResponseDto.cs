using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для відповіді при роботі з файлами (блоб).
    /// </summary>
    public class BlobResponseDto
    {
        public BlobResponseDto()
        {
            Blob = new BlobDto();
        }

        /// <summary>
        /// HTTP-статус виконання операції.
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Вказує, чи сталася помилка під час операції.
        /// Якщо так, повертає <c>True</c>, якщо ні повертає <c>False</c>.
        /// </summary>
        public bool Error { get; set; }

        /// <summary>
        /// Об'єкт блоб.
        /// </summary>
        public BlobDto Blob { get; set; }
    }
}

