using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class UpdatePermissionsEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "can_update_vcs_configuration",
                table: "permissions",
                newName: "has_vcs_accounts");

            migrationBuilder.AddColumn<bool>(
                name: "can_view_all_solutions",
                table: "permissions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "permissions",
                keyColumn: "role",
                keyValue: Role.Author,
                column: "can_view_all_solutions",
                value: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "can_view_all_solutions",
                table: "permissions");

            migrationBuilder.RenameColumn(
                name: "has_vcs_accounts",
                table: "permissions",
                newName: "can_update_vcs_configuration");
        }
    }
}
