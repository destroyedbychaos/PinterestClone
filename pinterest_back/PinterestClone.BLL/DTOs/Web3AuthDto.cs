namespace PinterestClone.BLL.DTOs
{
    public class NonceResponseDto
    {
        public string Nonce { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class VerifySignatureRequestDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }

    public class Web3AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserProfileDto User { get; set; } = new();
    }

    public class Web3UserProfileDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public string? Nickname { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public string? Discord { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 