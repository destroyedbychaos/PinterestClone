namespace PinterestClone.DAL.ViewModels
{
    public class RegisterVM
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public DateTime? BirthDate { get; set; }

    }
}
