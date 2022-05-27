using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class FixDeleteSolutionTriggers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS delete_solution_repository ON solutions;");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_delete_solution_repository();");

            migrationBuilder.Sql(@"
                CREATE FUNCTION solutions_delete_solution_repository() RETURNS TRIGGER AS
                $$
                BEGIN
                    DELETE FROM user_repositories WHERE id = OLD.repository_id;
                    RETURN OLD;
                END;
                $$ LANGUAGE plpgsql;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER delete_solution_repository
                    AFTER DELETE
                    ON solutions
                    FOR EACH ROW
                EXECUTE FUNCTION solutions_delete_solution_repository();
            ");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS delete_solution_repository ON solutions;");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_delete_solution_repository();");

            migrationBuilder.Sql(@"
                CREATE FUNCTION solutions_delete_solution_repository() RETURNS TRIGGER AS
                $$
                BEGIN
                    DELETE FROM repositories WHERE id = OLD.repository_id;
                    RETURN OLD;
                END;
                $$ LANGUAGE plpgsql;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER delete_solution_repository
                    AFTER DELETE
                    ON solutions
                    FOR EACH ROW
                EXECUTE FUNCTION solutions_delete_solution_repository();
            ");
        }
    }
}
