namespace PinterestClone.DAL.ViewModels
{
    public class JwtVM
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
