using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class AddActiveVcsAccount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "active_vcs_accounts",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    vcs_account_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(name: "pk_active_vcs_accounts_user_id", x => x.user_id);
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

            migrationBuilder.CreateIndex(
                name: "ix_active_vcs_accounts_vcs_account_id",
                table: "active_vcs_accounts",
                column: "vcs_account_id",
                unique: true);

            migrationBuilder.Sql(@"
                CREATE FUNCTION active_vcs_accounts_ensure_vcs_account_belongs_to_user() RETURNS trigger AS 
                $$
                DECLARE 
                    vcs_account vcs_accounts%ROWTYPE;
                BEGIN
                    SELECT * INTO vcs_account FROM vcs_accounts WHERE id = NEW.vcs_account_id;
                    IF vcs_account.user_id <> NEW.user_id THEN
                        RAISE 'Account does not belong to user.';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER ensure_vcs_account_belongs_to_user
                    BEFORE INSERT OR UPDATE 
                    ON active_vcs_accounts
                    FOR EACH ROW 
                EXECUTE FUNCTION active_vcs_accounts_ensure_vcs_account_belongs_to_user();
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "active_vcs_accounts");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS active_vcs_accounts_ensure_vcs_account_belongs_to_user();");
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_vcs_account_belongs_to_user ON active_vcs_accounts;");
        }
    }
}
