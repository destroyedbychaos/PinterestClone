namespace PinterestClone.BLL.DTOs
{
    /// <summary>
    /// Data Transfer Object для інформації про номер телефону користувача.
    /// </summary>
    public class PhoneInfoDto
    {
        /// <summary>
        /// Номер телефону.
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Чи підтверджений номер телефону.
        /// </summary>
        public bool IsPhoneNumberVerified { get; set; }

        /// <summary>
        /// Чи увімнені СМС-сповіщення.
        /// </summary>
        public bool SmsNotificationsEnabled { get; set; }

        /// <summary>
        /// Коли був підтверджений номер телефону.
        /// </summary>
        public DateTime? PhoneNumberVerifiedAt { get; set; }

        /// <summary>
        /// Зашифрований номер телефону.
        /// </summary>
        public string? MaskedPhoneNumber => MaskPhoneNumber(PhoneNumber);

        /// <summary>
        /// Шифрує номеру телефону.
        /// </summary>
        /// <param name="phoneNumber">Номер телефону</param>
        /// <returns>Зашифрований номер телефону як <see cref="string"/>.</returns>
        private static string? MaskPhoneNumber(string? phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber) || phoneNumber.Length < 4)
                return phoneNumber;

            return phoneNumber.Substring(0, phoneNumber.Length - 4) + "****";
        }
    }
} 