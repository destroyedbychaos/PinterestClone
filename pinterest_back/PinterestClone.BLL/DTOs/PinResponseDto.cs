namespace PinterestClone.BLL.DTOs
{
    public class PinResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? Link { get; set; }
        // public string? Tags { get; set; } //
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public List<BoardSimpleDto> Boards { get; set; } = [];
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
    }


    public class BoardSimpleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
} 