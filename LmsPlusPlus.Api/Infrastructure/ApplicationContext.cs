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

    static ApplicationContext() => NpgsqlConnection.GlobalTypeMapper.MapEnum<Role>();

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
    }

    protected ApplicationContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<Role>();
        modelBuilder.Entity<Permissions>().HasKey(p => p.Role);
        modelBuilder.Entity<Preferences>().HasKey(p => p.UserId);
        modelBuilder.Entity<Repository>().ToTable("repositories");
        modelBuilder.Entity<Preferences>()
            .HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<Preferences>(p => p.UserId);
        modelBuilder.Entity<Task>()
            .HasMany(t => t.Technologies)
            .WithMany(t => t.Tasks)
            .UsingEntity<Dictionary<string, object>>(joinEntityName: "TaskTechnology",
                j => j.HasOne<Technology>().WithMany().HasForeignKey("technology_id"),
                j => j.HasOne<Task>().WithMany().HasForeignKey("task_id"),
                j => j.ToTable("m2m_tasks_technologies"));
        modelBuilder.Entity<Group>()
            .HasMany(g => g.Users)
            .WithMany(u => u.Groups)
            .UsingEntity<Dictionary<string, object>>(joinEntityName: "UserGroup",
                j => j.HasOne<User>().WithMany().HasForeignKey("user_id"),
                j => j.HasOne<Group>().WithMany().HasForeignKey("group_id"),
                j => j.ToTable("m2m_users_groups"));
        base.OnModelCreating(modelBuilder);
    }
}
