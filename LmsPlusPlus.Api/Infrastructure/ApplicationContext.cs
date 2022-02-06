using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api.Infrastructure;

public class ApplicationContext : DbContext
{
    public DbSet<DatabaseModels.User> Users { get; set; } = null!;
    public DbSet<DatabaseModels.Topic> Topics { get; set; } = null!;
    public DbSet<DatabaseModels.Group> Groups { get; set; } = null!;
    public DbSet<DatabaseModels.Task> Tasks { get; set; } = null!;
    public DbSet<DatabaseModels.RepositoryHostingProvider> RepositoryHostingProviders { get; set; } = null!;
    public DbSet<DatabaseModels.Permissions> Permissions { get; set; } = null!;
    public DbSet<DatabaseModels.Preferences> Preferences { get; set; } = null!;
    public DbSet<DatabaseModels.Solution> Solutions { get; set; } = null!;

    static ApplicationContext() => NpgsqlConnection.GlobalTypeMapper.MapEnum<DatabaseModels.Role>();

    public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
    {
    }

    protected ApplicationContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<DatabaseModels.Role>();
        modelBuilder.Entity<DatabaseModels.Permissions>().HasKey(p => p.Role);
        base.OnModelCreating(modelBuilder);
    }
}
