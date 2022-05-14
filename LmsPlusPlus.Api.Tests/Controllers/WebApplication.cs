using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LmsPlusPlus.Api.Tests;

class WebApplication : IAsyncDisposable
{
    static int s_lastTestDatabaseId;
    readonly WebApplicationFactory<Program> _factory;
    readonly IServiceScope _scope;
    readonly string _testDatabaseName = CreateTestDatabaseName();

    internal HttpClient Client { get; }
    internal ApplicationContext Context { get; }
    internal JwtGenerator JwtGenerator { get; }

    internal WebApplication()
    {
        try
        {
            _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(webHostBuilder =>
            {
                webHostBuilder.ConfigureAppConfiguration((_, configurationBuilder) =>
                {
                    IConfigurationRoot configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Test.json").Build();
                    configurationBuilder.AddConfiguration(configuration);
                });
                webHostBuilder.ConfigureServices((context, services) =>
                {
                    ServiceDescriptor descriptor = services.First(s => s.ServiceType == typeof(ApplicationContext));
                    services.Remove(descriptor);
                    string? host = context.Configuration["PostgresHost"];
                    string? port = context.Configuration["PostgresPort"];
                    string? username = context.Configuration["PostgresUsername"];
                    string? password = context.Configuration["PostgresPassword"];
                    string connectionString =
                        $"Host={host};Port={port};Database={_testDatabaseName};Username={username};Password={password}";
                    services.AddDbContext<ApplicationContext, TestApplicationContext>(optionsBuilder =>
                    {
                        optionsBuilder
                            .UseNpgsql(connectionString)
                            .UseSnakeCaseNamingConvention();
                    });
                });
            });
            _scope = _factory.Server.Services.CreateScope();
            Context = _scope.ServiceProvider.GetRequiredService<TestApplicationContext>();
            Client = _factory.CreateClient();
            JwtGenerator = _scope.ServiceProvider.GetRequiredService<JwtGenerator>();
        }
        catch (Exception)
        {
            Context?.Database.EnsureDeleted();
            _scope?.Dispose();
            _factory?.Dispose();
            throw;
        }
    }

    public async ValueTask DisposeAsync()
    {
        await Context.Database.EnsureDeletedAsync();
        _scope.Dispose();
        await _factory.DisposeAsync();
    }

    static string CreateTestDatabaseName()
    {
        int id = Interlocked.Increment(ref s_lastTestDatabaseId);
        return $"lmsplusplus-test-{id}";
    }
}
