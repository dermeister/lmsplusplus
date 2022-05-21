﻿// <auto-generated />
using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LmsPlusPlus.Api.Migrations
{
    [DbContext(typeof(ApplicationContext))]
    [Migration("20220521091633_RemoveTechnologyIdPropertyFromSolution")]
    partial class RemoveTechnologyIdPropertyFromSolution
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresEnum(modelBuilder, "role", new[] { "admin", "author", "solver" });
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.ActiveVcsAccount", b =>
                {
                    b.Property<long>("UserId")
                        .HasColumnType("bigint")
                        .HasColumnName("user_id");

                    b.Property<long>("VcsAccountId")
                        .HasColumnType("bigint")
                        .HasColumnName("vcs_account_id");

                    b.HasKey("UserId")
                        .HasName("pk_active_vcs_accounts_user_id");

                    b.HasIndex("VcsAccountId")
                        .IsUnique()
                        .HasDatabaseName("ix_active_vcs_accounts_vcs_account_id");

                    b.ToTable("active_vcs_accounts", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Group", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("name");

                    b.Property<long>("TopicId")
                        .HasColumnType("bigint")
                        .HasColumnName("topic_id");

                    b.HasKey("Id")
                        .HasName("pk_groups_id");

                    b.HasIndex("TopicId")
                        .HasDatabaseName("ix_groups_topic_id");

                    b.ToTable("groups", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Permissions", b =>
                {
                    b.Property<Role>("Role")
                        .HasColumnType("role")
                        .HasColumnName("role");

                    b.Property<bool>("CanCreateSolution")
                        .HasColumnType("boolean")
                        .HasColumnName("can_create_solution");

                    b.Property<bool>("CanCreateTask")
                        .HasColumnType("boolean")
                        .HasColumnName("can_create_task");

                    b.Property<bool>("CanDeleteSolution")
                        .HasColumnType("boolean")
                        .HasColumnName("can_delete_solution");

                    b.Property<bool>("CanDeleteTask")
                        .HasColumnType("boolean")
                        .HasColumnName("can_delete_task");

                    b.Property<bool>("CanUpdateTask")
                        .HasColumnType("boolean")
                        .HasColumnName("can_update_task");

                    b.Property<bool>("CanUpdateUser")
                        .HasColumnType("boolean")
                        .HasColumnName("can_update_user");

                    b.Property<bool>("CanUpdateVcsConfiguration")
                        .HasColumnType("boolean")
                        .HasColumnName("can_update_vcs_configuration");

                    b.HasKey("Role")
                        .HasName("pk_permissions_role");

                    b.ToTable("permissions", (string)null);

                    b.HasData(
                        new
                        {
                            Role = Role.Admin,
                            CanCreateSolution = false,
                            CanCreateTask = false,
                            CanDeleteSolution = false,
                            CanDeleteTask = false,
                            CanUpdateTask = false,
                            CanUpdateUser = true,
                            CanUpdateVcsConfiguration = false
                        },
                        new
                        {
                            Role = Role.Author,
                            CanCreateSolution = false,
                            CanCreateTask = true,
                            CanDeleteSolution = false,
                            CanDeleteTask = true,
                            CanUpdateTask = true,
                            CanUpdateUser = false,
                            CanUpdateVcsConfiguration = false
                        },
                        new
                        {
                            Role = Role.Solver,
                            CanCreateSolution = true,
                            CanCreateTask = false,
                            CanDeleteSolution = true,
                            CanDeleteTask = false,
                            CanUpdateTask = false,
                            CanUpdateUser = false,
                            CanUpdateVcsConfiguration = true
                        });
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Preferences", b =>
                {
                    b.Property<long>("UserId")
                        .HasColumnType("bigint")
                        .HasColumnName("user_id");

                    b.Property<string>("Theme")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("theme");

                    b.HasKey("UserId")
                        .HasName("pk_preferences_user_id");

                    b.ToTable("preferences", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Repository", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<string>("CloneUrl")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("clone_url");

                    b.Property<long>("VcsAccountId")
                        .HasColumnType("bigint")
                        .HasColumnName("vcs_account_id");

                    b.Property<string>("WebsiteUrl")
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("website_url");

                    b.HasKey("Id")
                        .HasName("pk_repositories_id");

                    b.HasIndex("VcsAccountId")
                        .HasDatabaseName("ix_repositories_vcs_account_id");

                    b.HasIndex(new[] { "CloneUrl" }, "unq_repositories_clone_url")
                        .IsUnique()
                        .HasDatabaseName("ix_repositories_clone_url");

                    b.HasIndex(new[] { "WebsiteUrl" }, "unq_repositories_website_url")
                        .IsUnique()
                        .HasDatabaseName("ix_repositories_website_url");

                    b.ToTable("repositories", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Solution", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<long>("RepositoryId")
                        .HasColumnType("bigint")
                        .HasColumnName("repository_id");

                    b.Property<long>("SolverId")
                        .HasColumnType("bigint")
                        .HasColumnName("solver_id");

                    b.Property<long>("TaskId")
                        .HasColumnType("bigint")
                        .HasColumnName("task_id");

                    b.HasKey("Id")
                        .HasName("pk_solutions_id");

                    b.HasIndex("RepositoryId")
                        .HasDatabaseName("ix_solutions_repository_id");

                    b.HasIndex("TaskId")
                        .HasDatabaseName("ix_solutions_task_id");

                    b.HasIndex(new[] { "SolverId", "TaskId" }, "unq_solutions_solver_id_task_id")
                        .IsUnique()
                        .HasDatabaseName("ix_solutions_solver_id_task_id");

                    b.ToTable("solutions", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Task", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("description");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("title");

                    b.Property<long>("TopicId")
                        .HasColumnType("bigint")
                        .HasColumnName("topic_id");

                    b.HasKey("Id")
                        .HasName("pk_tasks_id");

                    b.HasIndex("TopicId")
                        .HasDatabaseName("ix_tasks_topic_id");

                    b.HasIndex(new[] { "Title", "TopicId" }, "unq_tasks_title_topic_id")
                        .IsUnique()
                        .HasDatabaseName("ix_tasks_title_topic_id");

                    b.ToTable("tasks", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Technology", b =>
                {
                    b.Property<short>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("smallint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<short>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.Property<long>("TemplateRepositoryId")
                        .HasColumnType("bigint")
                        .HasColumnName("template_repository_id");

                    b.HasKey("Id")
                        .HasName("pk_technologies_id");

                    b.HasIndex("TemplateRepositoryId")
                        .HasDatabaseName("ix_technologies_template_repository_id");

                    b.HasIndex(new[] { "Name", "TemplateRepositoryId" }, "unq_technologies_name_template_repository_id")
                        .IsUnique()
                        .HasDatabaseName("ix_technologies_name_template_repository_id");

                    b.ToTable("technologies", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Topic", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<long>("AuthorId")
                        .HasColumnType("bigint")
                        .HasColumnName("author_id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("name");

                    b.HasKey("Id")
                        .HasName("pk_topics_id");

                    b.HasIndex("AuthorId")
                        .HasDatabaseName("ix_topics_author_id");

                    b.HasIndex(new[] { "Name" }, "unq_topics_name")
                        .IsUnique()
                        .HasDatabaseName("ix_topics_name");

                    b.ToTable("topics", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("first_name");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("last_name");

                    b.Property<string>("Login")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("login");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)")
                        .HasColumnName("password_hash");

                    b.Property<Role>("Role")
                        .HasColumnType("role")
                        .HasColumnName("role");

                    b.HasKey("Id")
                        .HasName("pk_users_id");

                    b.HasIndex(new[] { "Login" }, "unq_users_login")
                        .IsUnique()
                        .HasDatabaseName("ix_users_login");

                    b.ToTable("users", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.VcsAccount", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityAlwaysColumn(b.Property<long>("Id"));

                    b.Property<string>("AccessToken")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("access_token");

                    b.Property<string>("HostingProviderId")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("hosting_provider_id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint")
                        .HasColumnName("user_id");

                    b.HasKey("Id")
                        .HasName("pk_vcs_accounts_id");

                    b.HasIndex("HostingProviderId")
                        .HasDatabaseName("ix_vcs_accounts_hosting_provider_id");

                    b.HasIndex("UserId")
                        .HasDatabaseName("ix_vcs_accounts_user_id");

                    b.HasIndex(new[] { "Name", "HostingProviderId" }, "vcs_accounts_name_hosting_provider_id_key")
                        .IsUnique()
                        .HasDatabaseName("ix_vcs_accounts_name_hosting_provider_id");

                    b.ToTable("vcs_accounts", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.VcsHostingProvider", b =>
                {
                    b.Property<string>("Id")
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)")
                        .HasColumnName("name");

                    b.HasKey("Id")
                        .HasName("pk_vcs_hosting_providers_id");

                    b.HasIndex(new[] { "Name" }, "unq_vcs_hosting_providers_name")
                        .IsUnique()
                        .HasDatabaseName("ix_vcs_hosting_providers_name");

                    b.ToTable("vcs_hosting_providers", (string)null);
                });

            modelBuilder.Entity("m2m_tasks_technologies", b =>
                {
                    b.Property<long>("TaskId")
                        .HasColumnType("bigint")
                        .HasColumnName("task_id");

                    b.Property<short>("TechnologyId")
                        .HasColumnType("smallint")
                        .HasColumnName("technology_id");

                    b.HasKey("TaskId", "TechnologyId")
                        .HasName("pk_m2m_tasks_technologies");

                    b.HasIndex("TechnologyId")
                        .HasDatabaseName("ix_m2m_tasks_technologies_technology_id");

                    b.ToTable("m2m_tasks_technologies", (string)null);
                });

            modelBuilder.Entity("m2m_users_groups", b =>
                {
                    b.Property<long>("UserId")
                        .HasColumnType("bigint")
                        .HasColumnName("user_id");

                    b.Property<long>("GroupId")
                        .HasColumnType("bigint")
                        .HasColumnName("group_id");

                    b.HasKey("UserId", "GroupId")
                        .HasName("pk_m2m_users_groups");

                    b.HasIndex("GroupId")
                        .HasDatabaseName("ix_m2m_users_groups_group_id");

                    b.ToTable("m2m_users_groups", (string)null);
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.ActiveVcsAccount", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", "User")
                        .WithOne()
                        .HasForeignKey("LmsPlusPlus.Api.Infrastructure.ActiveVcsAccount", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_active_vcs_accounts_user_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.VcsAccount", "VcsAccount")
                        .WithOne()
                        .HasForeignKey("LmsPlusPlus.Api.Infrastructure.ActiveVcsAccount", "VcsAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_active_vcs_accounts_vcs_account_id");

                    b.Navigation("User");

                    b.Navigation("VcsAccount");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Group", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Topic", "Topic")
                        .WithMany()
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_groups_topic_id");

                    b.Navigation("Topic");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Preferences", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", "User")
                        .WithOne()
                        .HasForeignKey("LmsPlusPlus.Api.Infrastructure.Preferences", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_preferences_user_id");

                    b.Navigation("User");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Repository", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.VcsAccount", "VcsAccount")
                        .WithMany()
                        .HasForeignKey("VcsAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_repositories_vcs_account_id");

                    b.Navigation("VcsAccount");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Solution", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Repository", "Repository")
                        .WithMany()
                        .HasForeignKey("RepositoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_solutions_repository_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", "Solver")
                        .WithMany()
                        .HasForeignKey("SolverId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_solutions_solver_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Task", "Task")
                        .WithMany()
                        .HasForeignKey("TaskId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_solutions_task_id");

                    b.Navigation("Repository");

                    b.Navigation("Solver");

                    b.Navigation("Task");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Task", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Topic", "Topic")
                        .WithMany()
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_tasks_topic_id");

                    b.Navigation("Topic");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Technology", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Repository", "TemplateRepository")
                        .WithMany()
                        .HasForeignKey("TemplateRepositoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_technologies_template_repository_id");

                    b.Navigation("TemplateRepository");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.Topic", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", "Author")
                        .WithMany()
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_topics_author_id");

                    b.Navigation("Author");
                });

            modelBuilder.Entity("LmsPlusPlus.Api.Infrastructure.VcsAccount", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.VcsHostingProvider", "HostingProvider")
                        .WithMany()
                        .HasForeignKey("HostingProviderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_vcs_accounts_hosting_provider_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_vcs_accounts_user_id");

                    b.Navigation("HostingProvider");

                    b.Navigation("User");
                });

            modelBuilder.Entity("m2m_tasks_technologies", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Task", null)
                        .WithMany()
                        .HasForeignKey("TaskId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_m2m_tasks_technologies_task_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Technology", null)
                        .WithMany()
                        .HasForeignKey("TechnologyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_m2m_tasks_technologies_technology_id");
                });

            modelBuilder.Entity("m2m_users_groups", b =>
                {
                    b.HasOne("LmsPlusPlus.Api.Infrastructure.Group", null)
                        .WithMany()
                        .HasForeignKey("GroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_m2m_users_groups_group_id");

                    b.HasOne("LmsPlusPlus.Api.Infrastructure.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_m2m_users_groups_user_id");
                });
#pragma warning restore 612, 618
        }
    }
}
