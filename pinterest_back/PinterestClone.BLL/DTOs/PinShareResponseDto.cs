namespace PinterestClone.BLL.DTOs
{
    public class PinShareResponseDto
    {
        public int Id { get; set; }
        public string PinId { get; set; } = string.Empty;
        public string SharedByUserId { get; set; } = string.Empty;
        public string SharedByUserName { get; set; } = string.Empty;
        public string SharedWithUserId { get; set; } = string.Empty;
        public string SharedWithUserName { get; set; } = string.Empty;
        public string? Message { get; set; }
        public DateTime SharedAt { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public PinResponseDto Pin { get; set; } = null!;
    }
}