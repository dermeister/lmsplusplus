using System.Diagnostics.CodeAnalysis;
using LmsPlusPlus.Api;
using LmsPlusPlus.Api.Infrastructure;
using LmsPlusPlus.Api.Vcs;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string>
{
    ["WorkingDirectory"] = Path.Combine(Path.GetTempPath(), path2: "lmsplusplus")
});
builder.Services.AddDbContext<ApplicationContext>((serviceProvider, optionsBuilder) =>
{
    IConfiguration configuration = serviceProvider.GetRequiredService<IConfiguration>();
    string? host = configuration["PostgresHost"];
    string? port = configuration["PostgresPort"];
    string? database = configuration["PostgresDb"];
    string? username = configuration["PostgresUsername"];
    string? password = configuration["PostgresPassword"];
    optionsBuilder
        .UseNpgsql($"Host={host};Port={port};Database={database};Username={username};Password={password}")
        .UseSnakeCaseNamingConvention();
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddScoped<VcsHostingOauthFactory>();
builder.Services.AddScoped<VcsHostingClientFactory>();
WebApplication app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting();
app.UseMiddleware<ProxyMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.UseEndpoints(endpoints => { endpoints.MapHub<ApplicationHub>("/application"); });
app.Run();

[SuppressMessage(category: "Design", checkId: "CA1050:Declare types in namespaces")]
public partial class Program
{
}
