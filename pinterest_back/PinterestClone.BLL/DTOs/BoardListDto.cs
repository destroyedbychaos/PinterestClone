using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    public class BoardListDto
    {
        public List<BoardSimpleDto> Boards { get; set; } = [];
        public Dictionary<string, List<BoardSimpleDto>>? GroupedBoards { get; set; }
        public int TotalCount { get; set; } = 0;
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}

