using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTestUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Видаляємо тестового користувача з email test@gmail.com
            migrationBuilder.Sql(@"
                DELETE FROM ""AspNetUsers"" 
                WHERE ""Email"" = 'test@gmail.com' 
                   OR ""Id"" = 'ad6d49ba-3c03-4aea-8c08-4bf4cdd2695c';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback - нічого не робимо, тестовий користувач не потрібен
        }
    }
}
