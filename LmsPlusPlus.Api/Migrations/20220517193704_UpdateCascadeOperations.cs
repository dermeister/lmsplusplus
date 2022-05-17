using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class UpdateCascadeOperations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_tasks_topic_id",
                table: "tasks");

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_topic_id",
                table: "tasks",
                column: "topic_id",
                principalTable: "topics",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_tasks_topic_id",
                table: "tasks");

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_topic_id",
                table: "tasks",
                column: "topic_id",
                principalTable: "topics",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
