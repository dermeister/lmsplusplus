using System.Diagnostics.CodeAnalysis;
using LmsPlusPlus.Api;
using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationContext>((serviceProvider, optionsBuilder) =>
{
    IConfiguration configuration = serviceProvider.GetRequiredService<IConfiguration>();
    string? host = configuration["POSTGRES_HOST"];
    string? port = configuration["POSTGRES_PORT"];
    string? database = configuration["POSTGRES_DB"];
    string? username = configuration["POSTGRES_USERNAME"];
    string? password = configuration["POSTGRES_PASSWORD"];
    optionsBuilder
        .UseNpgsql($"Host={host};Port={port};Database={database};Username={username};Password={password}")
        .UseSnakeCaseNamingConvention();
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddHttpClient();
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
