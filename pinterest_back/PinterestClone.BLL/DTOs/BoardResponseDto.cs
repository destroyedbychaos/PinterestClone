using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class BoardResponseDto
    {
        public required string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime CreatedAt { get; set; }

        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;

        public List<PinSimpleDto> Pins { get; set; } = [];
        public int PinCount => Pins.Count;
    }
}
