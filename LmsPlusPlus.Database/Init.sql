-- role
CREATE TYPE "public"."role" AS ENUM ('admin', 'author', 'solver');

-- users
CREATE TABLE "public"."users"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "login"         VARCHAR(500)    NOT NULL UNIQUE,
    "password_hash" VARCHAR(1000)   NOT NULL,
    "first_name"    VARCHAR(200)    NOT NULL,
    "last_name"     VARCHAR(200)    NOT NULL,
    "role"          "public"."role" NOT NULL
);

CREATE FUNCTION users_create_preferences_for_new_user() RETURNS TRIGGER AS
$$
BEGIN
    INSERT INTO "public"."preferences" (theme, user_id) VALUES ('Dark', NEW."id");
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "create_preferences_for_new_user"
    AFTER INSERT
    ON "public"."users"
    FOR EACH ROW
EXECUTE FUNCTION users_create_preferences_for_new_user();

-- permissions
CREATE TABLE "public"."permissions"
(
    "role"                         "public"."role" PRIMARY KEY,
    "can_create_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_delete_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_vcs_configuration" BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_user"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_create_solution"          BOOLEAN NOT NULL DEFAULT FALSE,
    "can_delete_solution"          BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO "public"."permissions"
VALUES ('admin', false, false, false, false, true, false, false),
       ('author', true, true, true, false, true, false, false),
       ('solver', false, false, false, true, false, true, true);

-- preferences
CREATE TABLE "public"."preferences"
(
    "id"      BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "theme"   VARCHAR(200) NOT NULL,
    "user_id" BIGINT       NOT NULL REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- topics
CREATE TABLE "public"."topics"
(
    "id"        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"      VARCHAR NOT NULL UNIQUE,
    "author_id" BIGINT  NOT NULL REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE FUNCTION user_has_role(user_id BIGINT, expected_role "public"."role") RETURNS BOOLEAN AS
$$
DECLARE
    actual_role "public"."role";
BEGIN
    SELECT "role" INTO actual_role FROM "public"."users" WHERE "id" = user_id;
    RETURN actual_role = expected_role;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION topics_ensure_user_has_author_role() RETURNS TRIGGER AS
$$
BEGIN
    IF NOT user_has_role(NEW."author_id", 'author') THEN
        RAISE 'author_id must belong to user with ''author'' role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_user_has_author_role"
    BEFORE INSERT OR UPDATE
    ON "public"."topics"
    FOR EACH ROW
EXECUTE FUNCTION topics_ensure_user_has_author_role();

-- groups
CREATE TABLE "public"."groups"
(
    "id"       BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"     VARCHAR(1000) NOT NULL,
    "topic_id" BIGINT        NOT NULL REFERENCES "public"."topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- m2m_users_groups
CREATE TABLE "public"."m2m_users_groups"
(
    "user_id"  BIGINT NOT NULL REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "group_id" BIGINT NOT NULL REFERENCES "public"."groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("user_id", "group_id")
);

-- tasks
CREATE TABLE "public"."tasks"
(
    "id"          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title"       VARCHAR(1000) NOT NULL,
    "description" TEXT          NOT NULL,
    "topic_id"    BIGINT        NOT NULL REFERENCES "public"."topics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE ("title", "topic_id")
);

CREATE FUNCTION tasks_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
$$
DECLARE
    technologies_count SMALLINT;
BEGIN
    SELECT COUNT("technologies"."id")
    INTO technologies_count
    FROM "tasks"
             JOIN "m2m_tasks_technologies" ON "tasks"."id" = "m2m_tasks_technologies"."task_id"
             JOIN "technologies" ON "m2m_tasks_technologies"."technology_id" = "technologies"."id"
    WHERE "tasks"."id" = NEW."id";
    IF technologies_count = 0 THEN
        RAISE 'Cannot create task. Task must have at least one technology';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "ensure_task_has_at_least_one_technology"
    AFTER INSERT OR UPDATE
    ON "public"."tasks" DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION tasks_ensure_task_has_at_least_one_technology();

-- vcs_hosting_providers
CREATE TABLE "public"."vcs_hosting_providers"
(
    "id"   VARCHAR(500) PRIMARY KEY,
    "name" VARCHAR(500) NOT NULL UNIQUE
);

-- vcs_accounts
CREATE TABLE "public"."vcs_accounts"
(
    "id"                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                VARCHAR(200) NOT NULL,
    "access_token"        VARCHAR(200) NOT NULL,
    "hosting_provider_id" VARCHAR(500) NOT NULL REFERENCES "public"."vcs_hosting_providers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("name", "hosting_provider_id")
);

-- repositories
CREATE TABLE "public"."repositories"
(
    "id"             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"           VARCHAR(1000) NOT NULL,
    "url"            VARCHAR(1000) NOT NULL UNIQUE,
    "vcs_account_id" BIGINT        NOT NULL REFERENCES "public"."vcs_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- technologies
CREATE TABLE "public"."technologies"
(
    "id"                     SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                   VARCHAR(200) NOT NULL,
    "template_repository_id" BIGINT       NOT NULL REFERENCES "public"."repositories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("name", "template_repository_id")
);

CREATE FUNCTION technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
$$
DECLARE
    tasks_that_have_technology BIGINT;
BEGIN
    SELECT COUNT(tasks.id)
    INTO tasks_that_have_technology
    FROM "public"."technologies"
             JOIN m2m_tasks_technologies ON technologies.id = m2m_tasks_technologies.technology_id
             JOIN tasks ON m2m_tasks_technologies.task_id = tasks.id
    WHERE technologies.id = OLD.id;
    IF tasks_that_have_technology > 0 THEN
        RAISE 'Cannot delete technology. Task must have at least one technology.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_task_has_at_least_one_technology"
    BEFORE DELETE
    ON "public"."technologies"
    FOR EACH ROW
EXECUTE FUNCTION technologies_ensure_task_has_at_least_one_technology();

-- m2m_tasks_technologies
CREATE TABLE "public"."m2m_tasks_technologies"
(
    "task_id"       BIGINT   NOT NULL REFERENCES "public"."tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "technology_id" SMALLINT NOT NULL REFERENCES "public"."technologies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("task_id", "technology_id")
);

CREATE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
$$
DECLARE
    technologies_count SMALLINT;
BEGIN
    SELECT COUNT("technologies"."id")
    INTO technologies_count
    FROM "tasks"
             JOIN "m2m_tasks_technologies" ON "tasks"."id" = "m2m_tasks_technologies"."task_id"
             JOIN "technologies" ON "m2m_tasks_technologies"."technology_id" = "technologies"."id"
    WHERE "tasks"."id" = OLD."task_id";
    IF technologies_count = 0 THEN
        RAISE 'Cannot remove technology from task. Task must have at least one technology.';
    END IF;
    IF NEW IS NULL THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_task_has_at_least_one_technology"
    BEFORE UPDATE OR DELETE
    ON "public"."m2m_tasks_technologies"
    FOR EACH ROW
EXECUTE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology();

-- solutions
CREATE TABLE "public"."solutions"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "repository_id" BIGINT   NOT NULL REFERENCES "public"."repositories" ("id"),
    "solver_id"     BIGINT   NOT NULL REFERENCES "public"."users" ("id"),
    "task_id"       BIGINT   NOT NULL REFERENCES "public"."tasks" ("id"),
    "technology_id" SMALLINT NOT NULL REFERENCES "public"."technologies" ("id"),
    UNIQUE ("solver_id", "task_id")
);

CREATE FUNCTION solutions_delete_solution_repository() RETURNS TRIGGER AS
$$
BEGIN
    DELETE FROM "public"."repositories" WHERE id = OLD."repository_id";
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "delete_solution_repository"
    AFTER DELETE
    ON "public"."solutions"
    FOR EACH ROW
EXECUTE FUNCTION solutions_delete_solution_repository();

CREATE FUNCTION solutions_ensure_user_has_solver_role() RETURNS TRIGGER AS
$$
BEGIN
    IF NOT user_has_role(NEW."solver_id", 'solver') THEN
        RAISE 'solver_id must belong to user with ''solver'' role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_user_has_solver_role"
    BEFORE INSERT OR UPDATE
    ON "public"."solutions"
    FOR EACH ROW
EXECUTE FUNCTION solutions_ensure_user_has_solver_role();
