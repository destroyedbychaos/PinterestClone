using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddPinViewHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PinViewHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PinId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    Source = table.Column<string>(type: "text", nullable: true),
                    ViewDuration = table.Column<int>(type: "integer", nullable: false),
                    IsCompleteView = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PinViewHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PinViewHistories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PinViewHistories_Pins_PinId",
                        column: x => x.PinId,
                        principalTable: "Pins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PinViewHistories_PinId",
                table: "PinViewHistories",
                column: "PinId");

            migrationBuilder.CreateIndex(
                name: "IX_PinViewHistories_UserId_ViewedAt",
                table: "PinViewHistories",
                columns: new[] { "UserId", "ViewedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PinViewHistories_ViewedAt",
                table: "PinViewHistories",
                column: "ViewedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PinViewHistories");
        }
    }
}
