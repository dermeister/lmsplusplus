using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class RemoveTechnologyIdPropertyFromSolution : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_solutions_technology_id",
                table: "solutions");

            migrationBuilder.DropIndex(
                name: "ix_solutions_technology_id",
                table: "solutions");

            migrationBuilder.DropColumn(
                name: "technology_id",
                table: "solutions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "technology_id",
                table: "solutions",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.CreateIndex(
                name: "ix_solutions_technology_id",
                table: "solutions",
                column: "technology_id");

            migrationBuilder.AddForeignKey(
                name: "fk_solutions_technology_id",
                table: "solutions",
                column: "technology_id",
                principalTable: "technologies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
