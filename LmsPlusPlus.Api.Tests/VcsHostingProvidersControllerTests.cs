using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class RepositoryHostingProvidersControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _author = null!;
    Infrastructure.User _solver = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _author = new Infrastructure.User
        {
            Login = "Author",
            PasswordHash = "Author",
            FirstName = "Author",
            LastName = "Author",
            Role = Infrastructure.Role.Author
        };
        _solver = new Infrastructure.User
        {
            Login = "Solver",
            PasswordHash = "Solver",
            FirstName = "Solver",
            LastName = "Solver",
            Role = Infrastructure.Role.Solver
        };
        Infrastructure.VcsHostingProvider provider = new()
        {
            Id = "provider",
            Name = "Provider"
        };
        _app.Context.AddRange(_author, _solver, provider);
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
    public async Task GetProvidersUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetProvidersForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_author.Id.ToString(), _author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetProvidersSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
