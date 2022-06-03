using System.Diagnostics.CodeAnalysis;
using System.Text;
using LmsPlusPlus.Api;
using LmsPlusPlus.Api.Infrastructure;
using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string>
{
    ["WorkingDirectory"] = Path.Combine(Path.GetTempPath(), path2: "lmsplusplus")
});
builder.Services.AddDbContext<ApplicationContext>((serviceProvider, optionsBuilder) =>
{
    IConfiguration configuration = serviceProvider.GetRequiredService<IConfiguration>(); // use builder.Configuration
    string? host = configuration["PostgresHost"];
    string? port = configuration["PostgresPort"];
    string? database = configuration["PostgresDb"];
    string? username = configuration["PostgresUsername"];
    string? password = configuration["PostgresPassword"];
    optionsBuilder.UseNpgsql($"Host={host};Port={port};Database={database};Username={username};Password={password}")
        .UseSnakeCaseNamingConvention();
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    string secret = builder.Configuration["JwtSecret"];
    SymmetricSecurityKey key = new(Encoding.Default.GetBytes(secret));
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["JwtIssuer"],
        ValidAudience = builder.Configuration["JwtAudience"],
        IssuerSigningKey = key,
        ValidateIssuerSigningKey = true
    };
});
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ContractResolver = new DefaultContractResolver
    {
        NamingStrategy = new CamelCaseNamingStrategy(processDictionaryKeys: true, overrideSpecifiedNames: false)
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddScoped<HostingClientFactory>();
builder.Services.AddScoped<JwtGenerator>();
builder.Services.AddHttpForwarder();
WebApplication app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ServiceProxyMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.UseEndpoints(endpoints => { endpoints.MapHub<ApplicationHub>("/application"); });
app.Run();

[SuppressMessage(category: "Design", checkId: "CA1050:Declare types in namespaces")]
public partial class Program
{
}
