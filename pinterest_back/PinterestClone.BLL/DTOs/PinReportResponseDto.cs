namespace PinterestClone.BLL.DTOs
{
    public class PinReportResponseDto
    {
        public int Id { get; set; }
        public string PinId { get; set; } = string.Empty;
        public string ReportedByUserId { get; set; } = string.Empty;
        public string ReportedByUserName { get; set; } = string.Empty;
        public string ReportMessage { get; set; } = string.Empty;
        public DateTime ReportedAt { get; set; }
        public bool IsResolved { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? ResolutionNotes { get; set; }
        public PinResponseDto Pin { get; set; } = null!;
    }
} 
