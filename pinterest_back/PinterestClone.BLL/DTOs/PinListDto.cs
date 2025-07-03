namespace PinterestClone.BLL.DTOs
{
    public class PinListDto
    {
        public List<PinSimpleDto> Pins { get; set; } = [];
        public int TotalCount { get; set; } = 0;
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
} 