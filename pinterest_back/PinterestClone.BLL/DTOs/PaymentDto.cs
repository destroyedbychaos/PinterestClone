namespace PinterestClone.BLL.DTOs
{
    public class ConfirmTransactionDto
    {
        public string TransactionHash { get; set; } = string.Empty;
        public string? OperationType { get; set; }
        public string? ContractAddress { get; set; }
        public string? TokenId { get; set; }
    }

    public class WebhookDto
    {
        public string TransactionHash { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TokenAddress { get; set; }
        public string BlockNumber { get; set; } = string.Empty;
        public string GasUsed { get; set; } = string.Empty;
        public string GasPrice { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class TransferDto
    {
        public string ToAddress { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? TokenAddress { get; set; }
    }

    public class BalanceDto
    {
        public string WalletAddress { get; set; } = string.Empty;
        public string? TokenAddress { get; set; }
        public string TokenSymbol { get; set; } = "MATIC";
        public decimal Balance { get; set; }
        public int Decimals { get; set; } = 18;
        public string FormattedBalance { get; set; } = string.Empty;
    }

    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TransactionHash { get; set; }
        public decimal? GasUsed { get; set; }
        public decimal? GasPrice { get; set; }
        public decimal? TransactionFee { get; set; }
        public string? ErrorCode { get; set; }
    }

    public class SupportedTokenDto
    {
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public int Decimals { get; set; }
        public string LogoUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class SupportedTokensResponseDto
    {
        public List<SupportedTokenDto> Tokens { get; set; } = new();
        public string NativeToken { get; set; } = "MATIC";
        public string NetworkName { get; set; } = "Polygon";
        public int ChainId { get; set; } = 137;
    }
} 