using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace LmsPlusPlus.Api.Tests;

public class TestApplicationContext : ApplicationContext
{
    public sealed override DatabaseFacade Database => base.Database;

    public TestApplicationContext(DbContextOptions<TestApplicationContext> options) : base(options)
    {
        IRelationalDatabaseCreator creator = Database.GetService<IRelationalDatabaseCreator>();
        if (!creator.Exists())
            creator.Create();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseDatabaseTemplate("lmsplusplus-test");
        base.OnModelCreating(modelBuilder);
    }
}
