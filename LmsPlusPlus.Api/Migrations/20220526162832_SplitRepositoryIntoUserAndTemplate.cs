using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class SplitRepositoryIntoUserAndTemplate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_solutions_repository_id",
                table: "solutions");

            migrationBuilder.DropForeignKey(
                name: "fk_technologies_template_repository_id",
                table: "technologies");

            migrationBuilder.DropTable(
                name: "active_vcs_accounts");

            migrationBuilder.DropTable(
                name: "repositories");

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "vcs_accounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "template_repositories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    clone_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_template_repositories_id", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_repositories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    clone_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    website_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    vcs_account_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_repositories_id", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_repositories_vcs_account_id",
                        column: x => x.vcs_account_id,
                        principalTable: "vcs_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_template_repositories_clone_url",
                table: "template_repositories",
                column: "clone_url",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_repositories_clone_url",
                table: "user_repositories",
                column: "clone_url",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_repositories_vcs_account_id",
                table: "user_repositories",
                column: "vcs_account_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_repositories_website_url",
                table: "user_repositories",
                column: "website_url",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_solutions_repository_id",
                table: "solutions",
                column: "repository_id",
                principalTable: "user_repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_technologies_template_repository_id",
                table: "technologies",
                column: "template_repository_id",
                principalTable: "template_repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_solutions_repository_id",
                table: "solutions");

            migrationBuilder.DropForeignKey(
                name: "fk_technologies_template_repository_id",
                table: "technologies");

            migrationBuilder.DropTable(
                name: "template_repositories");

            migrationBuilder.DropTable(
                name: "user_repositories");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "vcs_accounts");

            migrationBuilder.CreateTable(
                name: "active_vcs_accounts",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    vcs_account_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_active_vcs_accounts_user_id", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_active_vcs_accounts_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_active_vcs_accounts_vcs_account_id",
                        column: x => x.vcs_account_id,
                        principalTable: "vcs_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "repositories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    vcs_account_id = table.Column<long>(type: "bigint", nullable: false),
                    clone_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    website_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_repositories_id", x => x.id);
                    table.ForeignKey(
                        name: "fk_repositories_vcs_account_id",
                        column: x => x.vcs_account_id,
                        principalTable: "vcs_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_active_vcs_accounts_vcs_account_id",
                table: "active_vcs_accounts",
                column: "vcs_account_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_repositories_clone_url",
                table: "repositories",
                column: "clone_url",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_repositories_vcs_account_id",
                table: "repositories",
                column: "vcs_account_id");

            migrationBuilder.CreateIndex(
                name: "ix_repositories_website_url",
                table: "repositories",
                column: "website_url",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_solutions_repository_id",
                table: "solutions",
                column: "repository_id",
                principalTable: "repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_technologies_template_repository_id",
                table: "technologies",
                column: "template_repository_id",
                principalTable: "repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
