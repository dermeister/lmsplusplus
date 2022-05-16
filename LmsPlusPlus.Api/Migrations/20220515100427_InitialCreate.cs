using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LmsPlusPlus.Api.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterDatabase().Annotation("Npgsql:Enum:role", "admin,author,solver");

        migrationBuilder.CreateTable(name: "permissions", columns: table => new
        {
            role = table.Column<Role>(type: "role", nullable: false),
            can_create_task = table.Column<bool>(type: "boolean", nullable: false),
            can_update_task = table.Column<bool>(type: "boolean", nullable: false),
            can_delete_task = table.Column<bool>(type: "boolean", nullable: false),
            can_update_vcs_configuration = table.Column<bool>(type: "boolean", nullable: false),
            can_update_user = table.Column<bool>(type: "boolean", nullable: false),
            can_create_solution = table.Column<bool>(type: "boolean", nullable: false),
            can_delete_solution = table.Column<bool>(type: "boolean", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_permissions_role", x => x.role);
        });

        migrationBuilder.CreateTable(name: "users", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            login = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
            password_hash = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
            first_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            last_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            role = table.Column<Role>(type: "role", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_users_id", x => x.id);
        });

        migrationBuilder.CreateTable(name: "vcs_hosting_providers", columns: table => new
        {
            id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
            name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_vcs_hosting_providers_id", x => x.id);
        });

        migrationBuilder.CreateTable(name: "preferences", columns: table => new
        {
            user_id = table.Column<long>(type: "bigint", nullable: false),
            theme = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_preferences_user_id", x => x.user_id);
            table.ForeignKey(
                name: "fk_preferences_user_id",
                column: x => x.user_id,
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "topics", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            name = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
            author_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_topics_id", x => x.id);
            table.ForeignKey(
                name: "fk_topics_author_id",
                column: x => x.author_id,
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "vcs_accounts", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            access_token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            hosting_provider_id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
            user_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_vcs_accounts_id", x => x.id);
            table.ForeignKey(name: "fk_vcs_accounts_hosting_provider_id",
                column: x => x.hosting_provider_id,
                principalTable: "vcs_hosting_providers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_vcs_accounts_user_id",
                column: x => x.user_id,
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "groups", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            name = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
            topic_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_groups_id", x => x.id);
            table.ForeignKey(name: "fk_groups_topic_id",
                column: x => x.topic_id,
                principalTable: "topics",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "tasks", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            title = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
            description = table.Column<string>(type: "text", nullable: false),
            topic_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_tasks_id", x => x.id);
            table.ForeignKey(name: "fk_tasks_topic_id",
                column: x => x.topic_id,
                principalTable: "topics",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        });

        migrationBuilder.CreateTable(name: "repositories", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            clone_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
            website_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
            vcs_account_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_repositories_id", x => x.id);
            table.ForeignKey(name: "fk_repositories_vcs_account_id",
                column: x => x.vcs_account_id,
                principalTable: "vcs_accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "m2m_users_groups", columns: table => new
        {
            user_id = table.Column<long>(type: "bigint", nullable: false),
            group_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_m2m_users_groups", x => new { x.user_id, x.group_id });
            table.ForeignKey(name: "fk_m2m_users_groups_group_id",
                column: x => x.group_id,
                principalTable: "groups",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_m2m_users_groups_user_id",
                column: x => x.user_id,
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "technologies", columns: table => new
        {
            id = table.Column<short>(type: "smallint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
            template_repository_id = table.Column<long>(type: "bigint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_technologies_id", x => x.id);
            table.ForeignKey(name: "fk_technologies_template_repository_id",
                column: x => x.template_repository_id,
                principalTable: "repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "m2m_tasks_technologies", columns: table => new
        {
            task_id = table.Column<long>(type: "bigint", nullable: false),
            technology_id = table.Column<short>(type: "smallint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_m2m_tasks_technologies", x => new { x.task_id, x.technology_id });
            table.ForeignKey(name: "fk_m2m_tasks_technologies_task_id",
                column: x => x.task_id,
                principalTable: "tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_m2m_tasks_technologies_technology_id",
                column: x => x.technology_id,
                principalTable: "technologies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.CreateTable(name: "solutions", columns: table => new
        {
            id = table.Column<long>(type: "bigint", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
            repository_id = table.Column<long>(type: "bigint", nullable: false),
            solver_id = table.Column<long>(type: "bigint", nullable: false),
            task_id = table.Column<long>(type: "bigint", nullable: false),
            technology_id = table.Column<short>(type: "smallint", nullable: false)
        }, constraints: table =>
        {
            table.PrimaryKey("pk_solutions_id", x => x.id);
            table.ForeignKey(name: "fk_solutions_repository_id",
                column: x => x.repository_id,
                principalTable: "repositories",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_solutions_solver_id",
                column: x => x.solver_id,
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_solutions_task_id",
                column: x => x.task_id,
                principalTable: "tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            table.ForeignKey(name: "fk_solutions_technology_id",
                column: x => x.technology_id,
                principalTable: "technologies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        });

        migrationBuilder.InsertData(table: "permissions",
            columns: new[] { "role", "can_create_solution", "can_create_task", "can_delete_solution", "can_delete_task", "can_update_task", "can_update_user", "can_update_vcs_configuration" },
            values: new object[,]
            {
                { Role.Admin, false, false, false, false, false, true, false },
                { Role.Author, false, true, false, true, true, false, false },
                { Role.Solver, true, false, true, false, false, false, true }
            });

        migrationBuilder.CreateIndex(name: "ix_groups_topic_id", table: "groups", column: "topic_id");
        migrationBuilder.CreateIndex(name: "ix_m2m_tasks_technologies_technology_id", table: "m2m_tasks_technologies", column: "technology_id");
        migrationBuilder.CreateIndex(name: "ix_m2m_users_groups_group_id", table: "m2m_users_groups", column: "group_id");
        migrationBuilder.CreateIndex(name: "ix_repositories_clone_url", table: "repositories", column: "clone_url", unique: true);
        migrationBuilder.CreateIndex(name: "ix_repositories_vcs_account_id", table: "repositories", column: "vcs_account_id");
        migrationBuilder.CreateIndex(name: "ix_repositories_website_url", table: "repositories", column: "website_url", unique: true);
        migrationBuilder.CreateIndex(name: "ix_solutions_repository_id", table: "solutions", column: "repository_id");
        migrationBuilder.CreateIndex(name: "ix_solutions_solver_id_task_id", table: "solutions", columns: new[] { "solver_id", "task_id" }, unique: true);
        migrationBuilder.CreateIndex(name: "ix_solutions_task_id", table: "solutions", column: "task_id");
        migrationBuilder.CreateIndex(name: "ix_solutions_technology_id", table: "solutions", column: "technology_id");
        migrationBuilder.CreateIndex(name: "ix_tasks_title_topic_id", table: "tasks", columns: new[] { "title", "topic_id" }, unique: true);
        migrationBuilder.CreateIndex(name: "ix_tasks_topic_id", table: "tasks", column: "topic_id");
        migrationBuilder.CreateIndex(name: "ix_technologies_name_template_repository_id", table: "technologies", columns: new[] { "name", "template_repository_id" }, unique: true);
        migrationBuilder.CreateIndex(name: "ix_technologies_template_repository_id", table: "technologies", column: "template_repository_id");
        migrationBuilder.CreateIndex(name: "ix_topics_author_id", table: "topics", column: "author_id");
        migrationBuilder.CreateIndex(name: "ix_topics_name", table: "topics", column: "name", unique: true);
        migrationBuilder.CreateIndex(name: "ix_users_login", table: "users", column: "login", unique: true);
        migrationBuilder.CreateIndex(name: "ix_vcs_accounts_hosting_provider_id", table: "vcs_accounts", column: "hosting_provider_id");
        migrationBuilder.CreateIndex(name: "ix_vcs_accounts_name_hosting_provider_id", table: "vcs_accounts", columns: new[] { "name", "hosting_provider_id" }, unique: true);
        migrationBuilder.CreateIndex(name: "ix_vcs_accounts_user_id", table: "vcs_accounts", column: "user_id");
        migrationBuilder.CreateIndex(name: "ix_vcs_hosting_providers_name", table: "vcs_hosting_providers", column: "name", unique: true);

        migrationBuilder.Sql(@"
            CREATE FUNCTION is_user_in_role(user_id BIGINT, expected_role role) RETURNS BOOLEAN AS
            $$
            DECLARE
                actual_role role;
            BEGIN
                SELECT role INTO actual_role FROM users WHERE id = user_id;
                RETURN actual_role = expected_role;
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE FUNCTION users_create_preferences_for_new_user() RETURNS TRIGGER AS
            $$
            BEGIN
                INSERT INTO preferences (user_id, theme) VALUES (NEW.id, 'Dark');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE TRIGGER create_preferences_for_new_user
                AFTER INSERT
                ON users
                FOR EACH ROW
            EXECUTE FUNCTION users_create_preferences_for_new_user();
        ");

        migrationBuilder.Sql(@"
            CREATE FUNCTION topics_ensure_user_in_author_role() RETURNS TRIGGER AS
            $$
            BEGIN
                IF NOT is_user_in_role(NEW.author_id, 'author') THEN
                    RAISE 'author_id must be id of user with ''author'' role';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE TRIGGER ensure_user_in_author_role
                BEFORE INSERT OR UPDATE
                ON topics
                FOR EACH ROW
            EXECUTE FUNCTION topics_ensure_user_in_author_role();
        ");

        migrationBuilder.Sql(@"
            CREATE FUNCTION tasks_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
            $$
            DECLARE
                technologies_count SMALLINT;
            BEGIN
                SELECT COUNT(technologies.id)
                INTO technologies_count
                FROM tasks
                        JOIN m2m_tasks_technologies ON tasks.id = m2m_tasks_technologies.task_id
                        JOIN technologies ON m2m_tasks_technologies.technology_id = technologies.id
                WHERE tasks.id = NEW.id;
                IF technologies_count = 0 THEN
                    RAISE 'Cannot create task. Task must have at least one technology';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE CONSTRAINT TRIGGER ensure_task_has_at_least_one_technology
                AFTER INSERT OR UPDATE
                ON tasks DEFERRABLE INITIALLY DEFERRED
                FOR EACH ROW
            EXECUTE FUNCTION tasks_ensure_task_has_at_least_one_technology();
        ");

        migrationBuilder.Sql(@"
            CREATE FUNCTION technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
            $$
            DECLARE
                tasks_that_have_only_current_technology BIGINT;
            BEGIN
                WITH tasks_that_have_current_technology AS (SELECT task_id, technology_id
                                                            FROM m2m_tasks_technologies
                                                            WHERE technology_id = OLD.id)
                SELECT COUNT(task_id)
                INTO tasks_that_have_only_current_technology
                FROM tasks_that_have_current_technology
                GROUP BY task_id
                HAVING COUNT(technology_id) = 1;
                IF tasks_that_have_only_current_technology > 0 THEN
                    RAISE 'Cannot delete technology. Task must have at least one technology.';
                END IF;
                RETURN OLD;
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE CONSTRAINT TRIGGER ensure_task_has_at_least_one_technology
                AFTER DELETE
                ON technologies DEFERRABLE INITIALLY DEFERRED
                FOR EACH ROW
            EXECUTE FUNCTION technologies_ensure_task_has_at_least_one_technology();
        ");

        migrationBuilder.Sql(@"
            CREATE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
            $$
            DECLARE
                technologies_count SMALLINT;
            BEGIN
                IF EXISTS(SELECT 1 FROM tasks WHERE id = OLD.task_id) THEN
                    SELECT COUNT(technologies.id)
                    INTO technologies_count
                    FROM tasks
                            JOIN m2m_tasks_technologies ON tasks.id = m2m_tasks_technologies.task_id
                            JOIN technologies ON m2m_tasks_technologies.technology_id = technologies.id
                    WHERE tasks.id = OLD.task_id;
                    IF technologies_count = 0 THEN
                        RAISE 'Cannot remove technology from task. Task must have at least one technology.';
                    END IF;
                END IF;
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        ");

        migrationBuilder.Sql(@"
            CREATE CONSTRAINT TRIGGER ensure_task_has_at_least_one_technology
                AFTER UPDATE OR DELETE
                ON m2m_tasks_technologies DEFERRABLE INITIALLY DEFERRED
                FOR EACH ROW
            EXECUTE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology();
        ");

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

        migrationBuilder.Sql(@"
            CREATE FUNCTION solutions_ensure_user_in_solver_role() RETURNS TRIGGER AS
            $$
            BEGIN
                IF NOT is_user_in_role(NEW.solver_id, 'solver') THEN
                    RAISE 'solver_id must id of user with ''solver'' role';
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

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS create_preferences_for_new_user ON users;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS users_create_preferences_for_new_user;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_user_in_author_role ON topics;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS topics_ensure_user_in_author_role;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS create_preferences_for_new_user ON users;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS users_create_preferences_for_new_user;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_user_in_author_role ON topics;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS topics_ensure_user_in_author_role;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_task_has_at_least_one_technology ON tasks;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS tasks_ensure_task_has_at_least_one_technology;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_task_has_at_least_one_technology ON technologies;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS technologies_ensure_task_has_at_least_one_technology;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_task_has_at_least_one_technology ON m2m_tasks_technologies;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS m2m_tasks_technologies_ensure_task_has_at_least_one_technology;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS delete_solution_repository ON solutions;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_delete_solution_repository;");
        migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS ensure_user_in_solver_role ON solutions;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS solutions_ensure_user_in_solver_role;");
        migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS is_user_in_role;");
        migrationBuilder.DropTable("m2m_tasks_technologies");
        migrationBuilder.DropTable("m2m_users_groups");
        migrationBuilder.DropTable("permissions");
        migrationBuilder.DropTable("preferences");
        migrationBuilder.DropTable("solutions");
        migrationBuilder.DropTable("groups");
        migrationBuilder.DropTable("tasks");
        migrationBuilder.DropTable("technologies");
        migrationBuilder.DropTable("topics");
        migrationBuilder.DropTable("repositories");
        migrationBuilder.DropTable("vcs_accounts");
        migrationBuilder.DropTable("vcs_hosting_providers");
        migrationBuilder.DropTable("users");
        migrationBuilder.Sql("DROP TYPE IF EXISTS role;");
    }
}
