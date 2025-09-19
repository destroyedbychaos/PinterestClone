using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class CreateNFTTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NFTs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    TokenId = table.Column<string>(type: "text", nullable: false),
                    ContractAddress = table.Column<string>(type: "text", nullable: false),
                    ChainId = table.Column<string>(type: "text", nullable: false),
                    OwnerWalletAddress = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    IsForSale = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NFTs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserFavorites",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserWalletAddress = table.Column<string>(type: "text", nullable: false),
                    NFTId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserFavorites_NFTs_NFTId",
                        column: x => x.NFTId,
                        principalTable: "NFTs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NFTs_CreatedAt",
                table: "NFTs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_NFTs_OwnerWalletAddress",
                table: "NFTs",
                column: "OwnerWalletAddress");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavorites_CreatedAt",
                table: "UserFavorites",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavorites_NFTId",
                table: "UserFavorites",
                column: "NFTId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavorites_UserWalletAddress",
                table: "UserFavorites",
                column: "UserWalletAddress");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavorites_UserWalletAddress_NFTId",
                table: "UserFavorites",
                columns: new[] { "UserWalletAddress", "NFTId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFavorites");

            migrationBuilder.DropTable(
                name: "NFTs");
        }
    }
}
