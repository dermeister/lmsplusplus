using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api.Infrastructure;

public class ApplicationContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Topic> Topics { get; set; } = null!;
    public DbSet<Group> Groups { get; set; } = null!;
    public DbSet<Task> Tasks { get; set; } = null!;
    public DbSet<VcsHostingProvider> VcsHostingProviders { get; set; } = null!;
    public DbSet<Permissions> Permissions { get; set; } = null!;
    public DbSet<Preferences> Preferences { get; set; } = null!;
    public DbSet<Technology> Technologies { get; set; } = null!;
    public DbSet<Solution> Solutions { get; set; } = null!;
    public DbSet<VcsAccount> VcsAccounts { get; set; } = null!;
    public DbSet<TemplateRepository> TemplateRepositories { get; set; } = null!;

    static ApplicationContext() => NpgsqlConnection.GlobalTypeMapper.MapEnum<Role>();

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
        Database.Migrate();
        var connection = (NpgsqlConnection)Database.GetDbConnection();
        connection.Open();
        try
        {
            connection.ReloadTypes();
        }
        finally
        {
            connection.Close();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureRoleEnum(modelBuilder);
        ConfigureUserEntity(modelBuilder);
        ConfigurePermissionsEntity(modelBuilder);
        ConfigurePreferencesEntity(modelBuilder);
        ConfigureTopicEntity(modelBuilder);
        ConfigureGroupEntity(modelBuilder);
        ConfigureTaskEntity(modelBuilder);
        ConfigureVcsHostingProviderEntity(modelBuilder);
        ConfigureVcsAccountEntity(modelBuilder);
        ConfigureUserRepositoryEntity(modelBuilder);
        ConfigureTemplateRepositoryEntity(modelBuilder);
        ConfigureTechnologyEntity(modelBuilder);
        ConfigureSolutionEntity(modelBuilder);
        base.OnModelCreating(modelBuilder);
    }

    static void ConfigureRoleEnum(ModelBuilder modelBuilder) => modelBuilder.HasPostgresEnum<Role>();

    static void ConfigureUserEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
       {
           entity.ToTable("users");
           entity.HasKey(e => e.Id).HasName("pk_users_id");
           entity.Property(e => e.Id)
               .HasColumnName("id")
               .UseIdentityAlwaysColumn();
           entity.Property(e => e.FirstName)
               .HasMaxLength(200)
               .HasColumnName("first_name");
           entity.Property(e => e.LastName)
               .HasMaxLength(200)
               .HasColumnName("last_name");
           entity.Property(e => e.Login)
               .HasMaxLength(500)
               .HasColumnName("login");
           entity.Property(e => e.PasswordHash)
               .HasMaxLength(1000)
               .HasColumnName("password_hash");
           entity.HasMany(d => d.Groups)
               .WithMany(p => p.Users)
               .UsingEntity<Dictionary<string, object>>(joinEntityName: "m2m_users_groups",
                   r => r.HasOne<Group>()
                       .WithMany()
                       .HasForeignKey("GroupId")
                       .OnDelete(DeleteBehavior.Cascade)
                       .HasConstraintName("fk_m2m_users_groups_group_id"),
                   l => l.HasOne<User>()
                       .WithMany()
                       .HasForeignKey("UserId")
                       .OnDelete(DeleteBehavior.Cascade)
                       .HasConstraintName("fk_m2m_users_groups_user_id"),
                   j =>
                   {
                       j.HasKey("UserId", "GroupId").HasName("pk_m2m_users_groups");
                       j.ToTable("m2m_users_groups");
                       j.IndexerProperty<long>("UserId").HasColumnName("user_id");
                       j.IndexerProperty<long>("GroupId").HasColumnName("group_id");
                   });
           entity.HasIndex(e => e.Login, name: "unq_users_login").IsUnique();
       });
    }

    static void ConfigurePermissionsEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Permissions>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(p => p.Role).HasName("pk_permissions_role");
            entity.Property(e => e.CanCreateSolution).HasColumnName("can_create_solution");
            entity.Property(e => e.CanCreateTask).HasColumnName("can_create_task");
            entity.Property(e => e.CanDeleteSolution).HasColumnName("can_delete_solution");
            entity.Property(e => e.CanDeleteTask).HasColumnName("can_delete_task");
            entity.Property(e => e.CanUpdateTask).HasColumnName("can_update_task");
            entity.Property(e => e.CanUpdateUser).HasColumnName("can_update_user");
            entity.Property(e => e.CanUpdateVcsConfiguration).HasColumnName("can_update_vcs_configuration");
            entity.HasData(new Permissions
            {
                Role = Role.Admin,
                CanCreateTask = false,
                CanUpdateTask = false,
                CanDeleteTask = false,
                CanUpdateVcsConfiguration = false,
                CanUpdateUser = true,
                CanCreateSolution = false,
                CanDeleteSolution = false
            },
            new Permissions
            {
                Role = Role.Author,
                CanCreateTask = true,
                CanUpdateTask = true,
                CanDeleteTask = true,
                CanUpdateVcsConfiguration = false,
                CanUpdateUser = false,
                CanCreateSolution = false,
                CanDeleteSolution = false
            },
            new Permissions
            {
                Role = Role.Solver,
                CanCreateTask = false,
                CanUpdateTask = false,
                CanDeleteTask = false,
                CanUpdateVcsConfiguration = true,
                CanUpdateUser = false,
                CanCreateSolution = true,
                CanDeleteSolution = true
            });
        });
    }

    static void ConfigurePreferencesEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Preferences>(entity =>
        {
            entity.ToTable("preferences");
            entity.HasKey(p => p.UserId).HasName("pk_preferences_user_id");
            entity.Property(p => p.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(p => p.Theme)
                .HasMaxLength(200)
                .HasColumnName("theme");
            entity.HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Preferences>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_preferences_user_id");
        });
    }

    static void ConfigureTopicEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Topic>(entity =>
        {
            entity.ToTable("topics");
            entity.HasKey(t => t.Id).HasName("pk_topics_id");
            entity.Property(t => t.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(t => t.AuthorId).HasColumnName("author_id");
            entity.Property(t => t.Name)
                .HasMaxLength(1000)
                .HasColumnName("name");
            entity.HasOne(t => t.Author)
                .WithMany()
                .HasForeignKey(t => t.AuthorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_topics_author_id");
            entity.HasIndex(t => t.Name, name: "unq_topics_name").IsUnique();
        });
    }

    static void ConfigureGroupEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>(entity =>
        {
            entity.ToTable("groups");
            entity.HasKey(g => g.Id).HasName("pk_groups_id");
            entity.Property(g => g.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(g => g.Name)
                .HasMaxLength(1000)
                .HasColumnName("name");
            entity.Property(g => g.TopicId).HasColumnName("topic_id");
            entity.HasOne(g => g.Topic)
                .WithMany()
                .HasForeignKey(g => g.TopicId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_groups_topic_id");
        });
    }

    static void ConfigureTaskEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Task>(entity =>
        {
            entity.ToTable("tasks");
            entity.HasKey(t => t.Id).HasName("pk_tasks_id");
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(t => t.Description).HasColumnName("description");
            entity.Property(t => t.Title)
                .HasMaxLength(1000)
                .HasColumnName("title");
            entity.Property(t => t.TopicId).HasColumnName("topic_id");
            entity.HasOne(t => t.Topic)
                .WithMany()
                .HasForeignKey(t => t.TopicId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_tasks_topic_id");
            entity.HasMany(t => t.Technologies)
                .WithMany(t => t.Tasks)
                .UsingEntity<Dictionary<string, object>>(joinEntityName: "m2m_tasks_technologies",
                    l => l.HasOne<Technology>()
                        .WithMany()
                        .HasForeignKey("TechnologyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .HasConstraintName("fk_m2m_tasks_technologies_technology_id"),
                    r => r.HasOne<Task>()
                        .WithMany()
                        .HasForeignKey("TaskId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .HasConstraintName("fk_m2m_tasks_technologies_task_id"),
                    j =>
                    {
                        j.HasKey("TaskId", "TechnologyId").HasName("pk_m2m_tasks_technologies");
                        j.ToTable("m2m_tasks_technologies");
                        j.IndexerProperty<long>("TaskId").HasColumnName("task_id");
                        j.IndexerProperty<short>("TechnologyId").HasColumnName("technology_id");
                    });
            entity.HasIndex(t => new { t.Title, t.TopicId }, "unq_tasks_title_topic_id").IsUnique();
        });
    }

    static void ConfigureVcsHostingProviderEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VcsHostingProvider>(entity =>
        {
            entity.ToTable("vcs_hosting_providers");
            entity.HasKey(v => v.Id).HasName("pk_vcs_hosting_providers_id");
            entity.Property(v => v.Id)
                .HasMaxLength(500)
                .HasColumnName("id");
            entity.Property(v => v.Name)
                .HasMaxLength(500)
                .HasColumnName("name");
            entity.Property(v => v.OauthClientId)
                .HasMaxLength(200)
                .HasColumnName("oauth_client_id");
            entity.Property(v => v.OauthClientSecret)
                .HasMaxLength(200)
                .HasColumnName("oauth_client_secret");
            entity.HasIndex(v => v.Name, "unq_vcs_hosting_providers_name").IsUnique();
        });
    }

    static void ConfigureVcsAccountEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VcsAccount>(entity =>
        {
            entity.ToTable("vcs_accounts");
            entity.HasKey(v => v.Id).HasName("pk_vcs_accounts_id");
            entity.Property(v => v.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(v => v.AccessToken)
                .HasMaxLength(200)
                .HasColumnName("access_token");
            entity.Property(v => v.HostingProviderId)
                .HasMaxLength(500)
                .HasColumnName("hosting_provider_id");
            entity.Property(v => v.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            entity.Property(v => v.UserId).HasColumnName("user_id");
            entity.HasOne(v => v.HostingProvider)
                .WithMany()
                .HasForeignKey(v => v.HostingProviderId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_vcs_accounts_hosting_provider_id");
            entity.HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_vcs_accounts_user_id");
            entity.HasIndex(v => new { v.Name, v.HostingProviderId }, "vcs_accounts_name_hosting_provider_id_key").IsUnique();
        });
    }

    static void ConfigureUserRepositoryEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRepository>(entity =>
        {
            entity.ToTable("user_repositories");
            entity.HasKey(u => u.Id).HasName("pk_user_repositories_id");
            entity.Property(u => u.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(u => u.CloneUrl)
                .HasMaxLength(1000)
                .HasColumnName("clone_url");
            entity.Property(u => u.VcsAccountId).HasColumnName("vcs_account_id");
            entity.Property(u => u.WebsiteUrl)
                .HasMaxLength(1000)
                .HasColumnName("website_url");
            entity.HasOne(u => u.VcsAccount)
                .WithMany()
                .HasForeignKey(u => u.VcsAccountId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_user_repositories_vcs_account_id");
            entity.HasIndex(u => u.CloneUrl, name: "unq_user_repositories_clone_url").IsUnique();
            entity.HasIndex(u => u.WebsiteUrl, name: "unq_user_repositories_website_url").IsUnique();
        });
    }

    static void ConfigureTemplateRepositoryEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TemplateRepository>(entity =>
        {
            entity.ToTable("template_repositories");
            entity.HasKey(t => t.Id).HasName("pk_template_repositories_id");
            entity.Property(t => t.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(t => t.CloneUrl)
                .HasMaxLength(1000)
                .HasColumnName("clone_url");
            entity.HasIndex(t => t.CloneUrl, name: "unq_repositories_clone_url").IsUnique();
        });
    }


    static void ConfigureSolutionEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Solution>(entity =>
        {
            entity.ToTable("solutions");
            entity.HasKey(s => s.Id).HasName("pk_solutions_id");
            entity.Property(s => s.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(s => s.RepositoryId).HasColumnName("repository_id");
            entity.Property(s => s.SolverId).HasColumnName("solver_id");
            entity.Property(s => s.TaskId).HasColumnName("task_id");
            entity.HasOne(s => s.Repository)
                .WithMany()
                .HasForeignKey(s => s.RepositoryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_solutions_repository_id");
            entity.HasOne(s => s.Solver)
                .WithMany()
                .HasForeignKey(s => s.SolverId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_solutions_solver_id");
            entity.HasOne(s => s.Task)
                .WithMany()
                .HasForeignKey(s => s.TaskId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_solutions_task_id");
            entity.HasIndex(s => new { s.SolverId, s.TaskId }, name: "unq_solutions_solver_id_task_id").IsUnique();
        });
    }

    static void ConfigureTechnologyEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Technology>(entity =>
        {
            entity.ToTable("technologies");
            entity.HasKey(t => t.Id).HasName("pk_technologies_id");
            entity.Property(t => t.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();
            entity.Property(t => t.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            entity.Property(t => t.TemplateRepositoryId).HasColumnName("template_repository_id");
            entity.HasOne(t => t.TemplateRepository)
                .WithMany()
                .HasForeignKey(t => t.TemplateRepositoryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_technologies_template_repository_id");
            entity.HasIndex(t => new { t.Name, t.TemplateRepositoryId }, name: "unq_technologies_name_template_repository_id").IsUnique();
        });
    }
}
