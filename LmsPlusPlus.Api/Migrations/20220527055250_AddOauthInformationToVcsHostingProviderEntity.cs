using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class AddOauthInformationToVcsHostingProviderEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "oauth_client_id",
                table: "vcs_hosting_providers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "oauth_client_secret",
                table: "vcs_hosting_providers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "oauth_client_id",
                table: "vcs_hosting_providers");

            migrationBuilder.DropColumn(
                name: "oauth_client_secret",
                table: "vcs_hosting_providers");
        }
    }
}
