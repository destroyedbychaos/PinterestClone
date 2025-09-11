using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для рекомендованих пінів.
    /// </summary>
    public class PinRecommendationDto
    {
        /// <summary>
        /// ID рекомендації.
        /// </summary>
        public string Id { get; set; } = null!;

        /// <summary>
        /// Назва рекомендації.
        /// </summary>
        public string Title { get; set; } = null!;

        /// <summary>
        /// Посилання на картинку.
        /// </summary>
        public string ImageUrl { get; set; } = null!;
    }

}
