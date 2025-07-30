using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketplaceListing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketplaceListings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    NFTId = table.Column<string>(type: "text", nullable: false),
                    SellerWalletAddress = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ListedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SoldAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BuyerWalletAddress = table.Column<string>(type: "text", nullable: true),
                    TransactionHash = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceListings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketplaceListings_NFTs_NFTId",
                        column: x => x.NFTId,
                        principalTable: "NFTs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceListings_IsActive",
                table: "MarketplaceListings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceListings_ListedAt",
                table: "MarketplaceListings",
                column: "ListedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceListings_NFTId",
                table: "MarketplaceListings",
                column: "NFTId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceListings_SellerWalletAddress",
                table: "MarketplaceListings",
                column: "SellerWalletAddress");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketplaceListings");
        }
    }
}
