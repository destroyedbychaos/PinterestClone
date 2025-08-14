using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerUrlToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"BannerUrl\" text;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"AspNetUsers\" DROP COLUMN IF EXISTS \"BannerUrl\";");
        }
    }
}
