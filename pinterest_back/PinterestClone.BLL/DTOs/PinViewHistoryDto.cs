using System;

namespace PinterestClone.BLL.DTOs
{
    public class PinViewHistoryDto
    {
        public Guid Id { get; set; }
        public Guid PinId { get; set; }
        public string PinTitle { get; set; } = string.Empty;
        public string? PinImageUrl { get; set; }
        public string? PinDescription { get; set; }
        public string PinAuthorName { get; set; } = string.Empty;
        public DateTime ViewedAt { get; set; }
        public string? Source { get; set; }
        public bool IsCompleteView { get; set; }
    }

    public class AddPinViewDto
    {
        public Guid PinId { get; set; }
        public string? Source { get; set; }
        public int? ViewDuration { get; set; }
        public bool IsCompleteView { get; set; } = false;
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
    }

    public class PinViewHistoryResponse
    {
        public List<PinViewHistoryDto> Views { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
