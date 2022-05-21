using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    public partial class UpdateSolutionTriggers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_user_in_solver_role ON solutions;");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_ensure_user_in_solver_role();");

            migrationBuilder.Sql(@"
                CREATE FUNCTION solutions_ensure_user_can_create_solution() RETURNS TRIGGER AS
                $$
                BEGIN
                    IF NOT is_user_in_role(NEW.solver_id, 'solver') THEN
                        RAISE 'solver_id must be id of user with ''solver'' role.';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM users
                        JOIN m2m_groups_users ON users.id = m2m_groups_users.user_id
                        JOIN groups ON m2m_groups_users.group_id = groups.id
                        JOIN topics ON groups.topic_id = topics.id
                        JOIN tasks ON topics.id = tasks.topic_id
                        WHERE tasks.id = NEW.task_id AND users.id = NEW.solver_id) THEN
                        RAISE 'Solver cannot create solution for this task.';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER ensure_user_can_create_solution
                    BEFORE INSERT OR UPDATE
                    ON solutions
                    FOR EACH ROW
                EXECUTE FUNCTION solutions_ensure_user_can_create_solution();
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_user_can_create_solution ON solutions;");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_ensure_user_can_create_solution();");

            migrationBuilder.Sql(@"
                CREATE FUNCTION solutions_ensure_user_in_solver_role() RETURNS TRIGGER AS
                $$
                BEGIN
                    IF NOT is_user_in_role(NEW.solver_id, 'solver') THEN
                        RAISE 'solver_id must be id of user with ''solver'' role.';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            ");

            migrationBuilder.Sql(@"
                CREATE TRIGGER ensure_user_in_solver_role
                    BEFORE INSERT OR UPDATE
                    ON solutions
                    FOR EACH ROW
                EXECUTE FUNCTION solutions_ensure_user_in_solver_role();
            ");
        }
    }
}
