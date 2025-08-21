using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class BlobDto
    {
        public string? Uri { get; set; }
        public string? Name { get; set; }
        public string ContentType { get; set; }
        [JsonIgnore]
        public Stream? Content { get; set; }
    }
}