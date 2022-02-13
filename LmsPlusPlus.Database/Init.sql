CREATE TYPE "public"."role" AS ENUM ('admin', 'author', 'solver');

CREATE TABLE "public"."users"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "login"         VARCHAR(500)    NOT NULL UNIQUE,
    "password_hash" VARCHAR(1000)   NOT NULL,
    "first_name"    VARCHAR(200)    NOT NULL,
    "last_name"     VARCHAR(200)    NOT NULL,
    "role"          "public"."role" NOT NULL
);

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

-- TODO: find out better solution
INSERT INTO "public"."permissions"
VALUES ('admin', false, false, false, false, true, false, false),
       ('author', true, true, true, false, true, false, false),
       ('solver', false, false, false, true, false, true, true);

CREATE TABLE "public"."preferences"
(
    "id"      BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "theme"   VARCHAR(200) NOT NULL,
    "user_id" BIGINT       NOT NULL REFERENCES "public"."users" ("id")
);

CREATE TABLE "public"."topics"
(
    "id"        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"      VARCHAR NOT NULL UNIQUE,
    "author_id" BIGINT  NOT NULL REFERENCES "public"."users" ("id") -- TODO: ensure role is 'author'
);

CREATE TABLE "public"."groups"
(
    id       BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name     VARCHAR(1000) NOT NULL,
    topic_id BIGINT        NOT NULL REFERENCES "public"."topics" ("id")
);

CREATE TABLE "public"."m2m_users_groups"
(
    "user_id"  BIGINT NOT NULL REFERENCES "public"."users" ("id"),
    "group_id" BIGINT NOT NULL REFERENCES "public"."groups" ("id"),
    UNIQUE ("user_id", "group_id")
);

CREATE TABLE "public"."tasks"
(
    "id"          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title"       VARCHAR(1000) NOT NULL,
    "description" TEXT          NOT NULL,
    "topic_id"    BIGINT        NOT NULL REFERENCES "public"."topics" ("id"),
    UNIQUE ("title", "topic_id")
);

CREATE TABLE "public"."vcs_hosting_providers"
(
    "id"   VARCHAR(500) PRIMARY KEY,
    "name" VARCHAR(500) NOT NULL UNIQUE
);

CREATE TABLE "public"."vcs_accounts"
(
    "id"                  BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                VARCHAR(200) NOT NULL,
    "access_token"        VARCHAR(200) NOT NULL,
    "hosting_provider_id" VARCHAR(500) NOT NULL REFERENCES "public"."vcs_hosting_providers" ("id"),
    UNIQUE ("name", "hosting_provider_id")
);

CREATE TABLE "public"."repositories"
(
    "id"             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"           VARCHAR(1000) NOT NULL,
    "url"            VARCHAR(1000) NOT NULL UNIQUE,
    "vcs_account_id" BIGINT        NOT NULL REFERENCES "public"."vcs_accounts" ("id")
);

CREATE TABLE "public"."technologies"
(
    "id"                     SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"                   VARCHAR(200) NOT NULL,
    "template_repository_id" BIGINT       NOT NULL REFERENCES "public"."repositories" ("id"),
    UNIQUE ("name", "template_repository_id")
);

CREATE TABLE "public"."m2m_tasks_technologies" -- TODO: check at the end of transaction that task contains at least one technology
(
    "task_id"       BIGINT   NOT NULL REFERENCES "public"."tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "technology_id" SMALLINT NOT NULL REFERENCES "public"."technologies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("task_id", "technology_id")
);

CREATE TABLE "public"."solutions"
(
    "id"            BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "repository_id" BIGINT   NOT NULL REFERENCES "public"."repositories" ("id"), -- TODO: add trigger for deleting repository
    "solver_id"     BIGINT   NOT NULL REFERENCES "public"."users" ("id"),        -- TODO: ensure role is 'solver'
    "task_id"       BIGINT   NOT NULL REFERENCES "public"."tasks" ("id"),
    "technology_id" SMALLINT NOT NULL REFERENCES "public"."technologies" ("id"),
    UNIQUE ("solver_id", "task_id")
);
