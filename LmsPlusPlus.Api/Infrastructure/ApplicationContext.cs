using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api.Infrastructure;

public class ApplicationContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Topic> Topics { get; set; } = null!;
    public DbSet<Group> Groups { get; set; } = null!;
    public DbSet<Task> Tasks { get; set; } = null!;
    public DbSet<RepositoryHostingProvider> RepositoryHostingProviders { get; set; } = null!;
    public DbSet<Permissions> Permissions { get; set; } = null!;
    public DbSet<Preferences> Preferences { get; set; } = null!;
    public DbSet<Solution> Solutions { get; set; } = null!;

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
        base.OnModelCreating(modelBuilder);
    }
}
