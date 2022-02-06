using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
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

    internal WebApplication()
    {
        try
        {
            _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(webHostBuilder =>
            {
                webHostBuilder.ConfigureServices((context, services) =>
                {
                    ServiceDescriptor descriptor = services.First(s => s.ServiceType == typeof(ApplicationContext));
                    services.Remove(descriptor);
                    string? host = context.Configuration["POSTGRES_HOST"];
                    string? port = context.Configuration["POSTGRES_PORT"];
                    string? username = context.Configuration["POSTGRES_USERNAME"];
                    string? password = context.Configuration["POSTGRES_PASSWORD"];
                    services.AddDbContext<ApplicationContext, TestApplicationContext>(optionsBuilder => optionsBuilder
                        .UseNpgsql($"Host={host};Port={port};Database={_testDatabaseName};Username={username};Password={password}")
                        .UseSnakeCaseNamingConvention());
                });
            });
            _scope = _factory.Server.Services.CreateScope();
            Context = _scope.ServiceProvider.GetRequiredService<TestApplicationContext>();
            Client = _factory.CreateClient();
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
