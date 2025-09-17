using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PinterestClone.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    SavesPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SavesInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LikesPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LikesInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CommentsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CommentsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CommentInteractionsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CommentInteractionsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MentionsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MentionsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RemindersPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RemindersInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NewAestsFromFollowedPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    NewAestsFromFollowedInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NewAestsFromSuggestedPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NewAestsFromSuggestedInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BoardRecommendationsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    BoardRecommendationsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    BoardRecommendationsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SearchRecommendationsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SearchRecommendationsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SearchRecommendationsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AestsInspiredByActivityPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AestsInspiredByActivityInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AestsInspiredByActivityEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AestsPickedForYouPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AestsPickedForYouInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AestsPickedForYouEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PopularAestsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PopularAestsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PopularAestsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    GroupBoardUpdatesPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    GroupBoardUpdatesInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    GroupBoardUpdatesEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    GroupBoardInvitationsPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    GroupBoardInvitationsInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    GroupBoardInvitationsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MessagesPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MessagesInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AestifyAnnouncementsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SurveysAndQuizzesEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ReportsAndViolationsEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PushEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    BrowserPushEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    InAppEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EmailEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationSettings_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSettings_UserId",
                table: "NotificationSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationSettings");
        }
    }
}
