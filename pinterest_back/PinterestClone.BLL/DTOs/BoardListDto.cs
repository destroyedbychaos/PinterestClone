using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для списку дошок.
    /// </summary>
    public class BoardListDto
    {
        /// <summary>
        /// Список дошок.
        /// </summary>
        public List<BoardSimpleDto> Boards { get; set; } = [];

        /// <summary>
        /// Список дошок згрупованих за певним ключем.
        /// </summary>
        public Dictionary<string, List<BoardSimpleDto>>? GroupedBoards { get; set; }

        /// <summary>
        /// Кількість дошок у списку.
        /// </summary>
        public int TotalCount { get; set; } = 0;

        /// <summary>
        /// Сторінка пагінації.
        /// </summary>
        public int PageNumber { get; set; }
        /// <summary>
        /// Розмір сторінки.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Загальна кількість сторінок у списку.
        /// </summary>
        public int TotalPages { get; set; }
    }
}

