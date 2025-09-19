namespace PinterestClone.BLL.DTOs
{
    public class TransactionDataDto
    {
        public string TransactionData { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }
} 