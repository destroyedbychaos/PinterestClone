using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для профілю користувача.
    /// </summary>
    public class UserProfileDto
    {
        /// <summary>
        /// ID користувача.
        /// </summary>
        public string Id { get; set; } = default!;

        /// <summary>
        /// Нікнейм користувача.
        /// </summary>
        public string UserName { get; set; } = default!;

        /// <summary>
        /// Публічне ім'я користувача.
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Посилання на аватарку користувача.
        /// </summary>
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Посилання на банер профілю користувача.
        /// </summary>
        public string? BannerUrl { get; set; } 

        /// <summary>
        /// Опис профілю користувача. 
        /// </summary>
        public string? Bio { get; set; }

        /// <summary>
        /// Дата народження користувача.
        /// </summary>
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// Стать користувача.
        /// </summary>
        public string? Gender { get; set; }

        /// <summary>
        /// Країна проживання користувача.
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// Мова користувача.
        /// </summary>
        public string? Language { get; set; }

        /// <summary>
        /// Чи профіль публічний.
        /// </summary>
        public bool IsProfilePublic { get; set; }

        /// <summary>
        /// Кількість підписників.
        /// </summary>
        public int FollowersCount { get; set; }

        /// <summary>
        /// Кількість користувачів на яких підписаний даний користувач.
        /// </summary>
        public int FollowingCount { get; set; }

        /// <summary>
        /// Чи підписаний.
        /// </summary>
        public bool IsFollowing { get; set; }

        /// <summary>
        /// Чи заблокований.
        /// </summary>
        public bool IsBlocked { get; set; }

        /// <summary>
        /// Чи заблокований певним користувачем.
        /// </summary>
        public bool IsBlockedBy { get; set; }
    }
}
