using LmsPlusPlus.Api;
using LmsPlusPlus.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
string? host = builder.Configuration["POSTGRES_HOST"];
string? port = builder.Configuration["POSTGRES_PORT"];
string? database = builder.Configuration["POSTGRES_DB"];
string? username = builder.Configuration["POSTGRES_USERNAME"];
string? password = builder.Configuration["POSTGRES_PASSWORD"];
builder.Services.AddDbContext<ApplicationContext>(optionsBuilder =>
{
    optionsBuilder.UseNpgsql($"Host={host};Port={port};Database={database};Username={username};Password={password}");
    optionsBuilder.UseSnakeCaseNamingConvention();
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
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
