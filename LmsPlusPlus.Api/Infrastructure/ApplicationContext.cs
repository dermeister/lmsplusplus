using LmsPlusPlus.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api.Infrastructure;

public sealed class ApplicationContext : DbContext
{
    public DbSet<Solution> Solutions { get; set; } = null!;

    public ApplicationContext(DbContextOptions options) : base(options) => Database.EnsureCreated();
}
