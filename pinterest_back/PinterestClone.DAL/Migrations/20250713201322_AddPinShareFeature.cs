using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddPinShareFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PinShares",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PinId = table.Column<Guid>(type: "uuid", nullable: false),
                    SharedByUserId = table.Column<string>(type: "text", nullable: false),
                    SharedWithUserId = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    SharedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PinShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PinShares_AspNetUsers_SharedByUserId",
                        column: x => x.SharedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PinShares_AspNetUsers_SharedWithUserId",
                        column: x => x.SharedWithUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PinShares_Pins_PinId",
                        column: x => x.PinId,
                        principalTable: "Pins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PinShares_PinId",
                table: "PinShares",
                column: "PinId");

            migrationBuilder.CreateIndex(
                name: "IX_PinShares_SharedAt",
                table: "PinShares",
                column: "SharedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PinShares_SharedByUserId",
                table: "PinShares",
                column: "SharedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PinShares_SharedWithUserId_IsRead",
                table: "PinShares",
                columns: new[] { "SharedWithUserId", "IsRead" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PinShares");
        }
    }
}
