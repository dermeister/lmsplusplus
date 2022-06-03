using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class AddUniqueIndexToGroupsEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_groups_name_topic_id",
                table: "groups",
                columns: new[] { "name", "topic_id" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_groups_name_topic_id",
                table: "groups");
        }
    }
}
