using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;

namespace LmsPlusPlus.Api.Tests;

public sealed class TestApplicationContext : ApplicationContext
{
    readonly IConfiguration _configuration;

    public TestApplicationContext(DbContextOptions<TestApplicationContext> options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
        IRelationalDatabaseCreator creator = Database.GetService<IRelationalDatabaseCreator>();
        if (!creator.Exists())
            creator.Create();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseDatabaseTemplate(_configuration["PostgresTemplateDb"]);
        base.OnModelCreating(modelBuilder);
    }
}
