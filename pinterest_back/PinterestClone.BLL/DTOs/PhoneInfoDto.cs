namespace PinterestClone.BLL.DTOs
{
    public class PhoneInfoDto
    {
        public string? PhoneNumber { get; set; }
        public bool IsPhoneNumberVerified { get; set; }
        public bool SmsNotificationsEnabled { get; set; }
        public DateTime? PhoneNumberVerifiedAt { get; set; }
        public string? MaskedPhoneNumber => MaskPhoneNumber(PhoneNumber);

        private static string? MaskPhoneNumber(string? phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber) || phoneNumber.Length < 4)
                return phoneNumber;

            return phoneNumber.Substring(0, phoneNumber.Length - 4) + "****";
        }
    }
} 