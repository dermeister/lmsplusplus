using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class TechnologiesControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _author = null!;
    Infrastructure.User _solver = null!;
    Infrastructure.User _admin = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _author = new Infrastructure.User
        {
            Login = "author",
            PasswordHash = "author",
            FirstName = "Author",
            LastName = "Author",
            Role = Infrastructure.Role.Author
        };
        _solver = new Infrastructure.User
        {
            Login = "solver",
            PasswordHash = "solver",
            FirstName = "Solver",
            LastName = "Solver",
            Role = Infrastructure.Role.Solver
        };
        _admin = new Infrastructure.User
        {
            Login = "admin",
            PasswordHash = "admin",
            FirstName = "Admin",
            LastName = "Admin",
            Role = Infrastructure.Role.Admin
        };
        _app.Context.AddRange(_author, _solver, _admin);
        try
        {
            await _app.Context.SaveChangesAsync();
        }
        catch (Exception)
        {
            await _app.DisposeAsync();
            throw;
        }
        Infrastructure.VcsHostingProvider provider = new()
        {
            Id = "provider",
            Name = "Provider"
        };
        Infrastructure.VcsAccount account = new()
        {
            Name = "account",
            AccessToken = "token",
            HostingProvider = provider,
            UserId = _admin.Id,
        };
        _app.Context.AddRange(provider, account);
        try
        {
            await _app.Context.SaveChangesAsync();
        }
        catch (Exception)
        {
            await _app.DisposeAsync();
            throw;
        }
    }

    public async Task DisposeAsync() => await _app.DisposeAsync();

    [Fact]
    public async Task GetAllTasksUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTasksForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_admin.Id.ToString(), _admin.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTasksSuccess()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_author.Id.ToString(), _author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
