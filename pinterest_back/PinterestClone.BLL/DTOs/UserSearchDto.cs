using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для пошуку користувача.
    /// </summary>
    public class UserSearchDto
    {
        /// <summary>
        /// ID користувача.
        /// </summary>
        public string Id { get; set; }    
        
        /// <summary>
        /// Нікнейм користувача.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Публічне ім'я користувача.
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Посилання на аватар користувача.
        /// </summary>
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Чи підписаний певний користувач на них.
        /// </summary>
        public bool IsFollowing { get; set; }
        public List<string> Interests { get; set; } = new();
        public List<string> Vibes { get; set; } = new();
    }
}
