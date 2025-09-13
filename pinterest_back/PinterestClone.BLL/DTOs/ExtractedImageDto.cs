using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class ExtractedImageDto
    {
        public string Id { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Alt { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string Loading { get; set; } = string.Empty;
    }
}
