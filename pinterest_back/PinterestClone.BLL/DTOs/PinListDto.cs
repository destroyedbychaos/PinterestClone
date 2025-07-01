namespace PinterestClone.BLL.DTOs
{
    public class PinListDto
    {
        public List<PinSimpleDto> Pins { get; set; } = [];
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class PinSimpleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        // public string? Tags { get; set; } // 
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int LikesCount { get; set; }
    }
} 