using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для файлу (блоб).
    /// </summary>
    public class BlobDto
    {
        /// <summary>
        /// Публічний URI для доступу до файлу.
        /// </summary>
        public string? Uri { get; set; }

        /// <summary>
        /// Назва файлу.
        /// </summary>
        public string? Name { get; set; }
        
        /// <summary>
        /// Тип файлу.
        /// </summary>
        public string ContentType { get; set; }

        /// <summary>
        /// Вміст файлу у вигляді потоку.
        /// </summary>
        [JsonIgnore]
        public Stream? Content { get; set; }
    }
}