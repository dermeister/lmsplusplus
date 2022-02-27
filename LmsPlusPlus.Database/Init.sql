-- types
CREATE TYPE "role" AS ENUM ('admin', 'author', 'solver');

CREATE TABLE "users"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "login"         VARCHAR(500)  NOT NULL UNIQUE,
    "password_hash" VARCHAR(1000) NOT NULL,
    "first_name"    VARCHAR(200)  NOT NULL,
    "last_name"     VARCHAR(200)  NOT NULL,
    "role"          "role"        NOT NULL
);

CREATE TABLE "permissions"
(
    "role"                         "role" PRIMARY KEY,
    "can_create_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_delete_task"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_vcs_configuration" BOOLEAN NOT NULL DEFAULT FALSE,
    "can_update_user"              BOOLEAN NOT NULL DEFAULT FALSE,
    "can_create_solution"          BOOLEAN NOT NULL DEFAULT FALSE,
    "can_delete_solution"          BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO "permissions"
VALUES ('admin', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE),
       ('author', TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE),
       ('solver', FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE);

CREATE TABLE "preferences"
(
    "user_id" BIGINT PRIMARY KEY REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "theme"   VARCHAR(200) NOT NULL
);

CREATE TABLE "topics"
(
    "id"        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"      VARCHAR NOT NULL UNIQUE,
    "author_id" BIGINT  NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "groups"
(
    "id"       BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"     VARCHAR(1000) NOT NULL,
    "topic_id" BIGINT        NOT NULL REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "m2m_users_groups"
(
    "user_id"  BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "group_id" BIGINT NOT NULL REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("user_id", "group_id")
);

CREATE TABLE "tasks"
(
    "id"          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title"       VARCHAR(1000) NOT NULL,
    "description" TEXT          NOT NULL,
    "topic_id"    BIGINT        NOT NULL REFERENCES "topics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE ("title", "topic_id")
);

CREATE TABLE "vcs_hosting_providers"
(
    "id"   VARCHAR(500) PRIMARY KEY,
    "name" VARCHAR(500) NOT NULL UNIQUE
);

CREATE TABLE "vcs_accounts"
(
    "id"                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                VARCHAR(200) NOT NULL,
    "access_token"        VARCHAR(200) NOT NULL,
    "user_id"             BIGINT       NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "hosting_provider_id" VARCHAR(500) NOT NULL REFERENCES "vcs_hosting_providers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("name", "hosting_provider_id")
);

CREATE TABLE "repositories"
(
    "id"             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "url"            VARCHAR(1000) NOT NULL UNIQUE,
    "vcs_account_id" BIGINT        NOT NULL REFERENCES "vcs_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "technologies"
(
    "id"                     SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                   VARCHAR(200) NOT NULL,
    "template_repository_id" BIGINT       NOT NULL REFERENCES "repositories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("name", "template_repository_id")
);

CREATE TABLE "m2m_tasks_technologies"
(
    "task_id"       BIGINT   NOT NULL REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "technology_id" SMALLINT NOT NULL REFERENCES "technologies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("task_id", "technology_id")
);

CREATE TABLE "solutions"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "repository_id" BIGINT   NOT NULL REFERENCES "repositories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "solver_id"     BIGINT   NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "task_id"       BIGINT   NOT NULL REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "technology_id" SMALLINT NOT NULL REFERENCES "technologies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("solver_id", "task_id")
);

-- functions
CREATE FUNCTION is_user_in_role(user_id BIGINT, expected_role "role") RETURNS BOOLEAN AS
$$
DECLARE
    actual_role "role";
BEGIN
    SELECT "role" INTO actual_role FROM "users" WHERE "id" = user_id;
    RETURN actual_role = expected_role;
END;
$$ LANGUAGE plpgsql;

-- triggers
CREATE FUNCTION users_create_preferences_for_new_user() RETURNS TRIGGER AS
$$
BEGIN
    INSERT INTO "preferences" ("user_id", "theme") VALUES (NEW."id", 'Dark');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "create_preferences_for_new_user"
    AFTER INSERT
    ON "users"
    FOR EACH ROW
EXECUTE FUNCTION users_create_preferences_for_new_user();

CREATE FUNCTION topics_ensure_user_in_author_role() RETURNS TRIGGER AS
$$
BEGIN
    IF NOT is_user_in_role(NEW."author_id", 'author') THEN
        RAISE 'author_id must be id of user with ''author'' role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_user_in_author_role"
    BEFORE INSERT OR UPDATE
    ON "topics"
    FOR EACH ROW
EXECUTE FUNCTION topics_ensure_user_in_author_role();

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
    ON "tasks" DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION tasks_ensure_task_has_at_least_one_technology();

CREATE FUNCTION technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
$$
DECLARE
    tasks_that_have_only_current_technology BIGINT;
BEGIN
    WITH "tasks_that_have_current_technology" AS (SELECT "task_id", "technology_id"
                                                  FROM "m2m_tasks_technologies"
                                                  WHERE technology_id = OLD."id")
    SELECT COUNT("task_id")
    INTO tasks_that_have_only_current_technology
    FROM "tasks_that_have_current_technology"
    GROUP BY "task_id"
    HAVING COUNT("technology_id") = 1;
    IF tasks_that_have_only_current_technology > 0 THEN
        RAISE 'Cannot delete technology. Task must have at least one technology.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "ensure_task_has_at_least_one_technology"
    AFTER DELETE
    ON "technologies" DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION technologies_ensure_task_has_at_least_one_technology();

CREATE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology() RETURNS TRIGGER AS
$$
DECLARE
    technologies_count SMALLINT;
BEGIN
    IF EXISTS(SELECT 1 FROM "tasks" WHERE "id" = OLD.task_id) THEN
        SELECT COUNT("technologies"."id")
        INTO technologies_count
        FROM "tasks"
                 JOIN "m2m_tasks_technologies" ON "tasks"."id" = "m2m_tasks_technologies"."task_id"
                 JOIN "technologies" ON "m2m_tasks_technologies"."technology_id" = "technologies"."id"
        WHERE "tasks"."id" = OLD."task_id";
        IF technologies_count = 0 THEN
            RAISE 'Cannot remove technology from task. Task must have at least one technology.';
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "ensure_task_has_at_least_one_technology"
    AFTER UPDATE OR DELETE
    ON "m2m_tasks_technologies" DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION m2m_tasks_technologies_ensure_task_has_at_least_one_technology();

CREATE FUNCTION solutions_delete_solution_repository() RETURNS TRIGGER AS
$$
BEGIN
    DELETE FROM "repositories" WHERE id = OLD."repository_id";
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "delete_solution_repository"
    AFTER DELETE
    ON "solutions"
    FOR EACH ROW
EXECUTE FUNCTION solutions_delete_solution_repository();

CREATE FUNCTION solutions_ensure_user_in_solver_role() RETURNS TRIGGER AS
$$
BEGIN
    IF NOT is_user_in_role(NEW."solver_id", 'solver') THEN
        RAISE 'solver_id must id of user with ''solver'' role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ensure_user_in_solver_role"
    BEFORE INSERT OR UPDATE
    ON "solutions"
    FOR EACH ROW
EXECUTE FUNCTION solutions_ensure_user_in_solver_role();
