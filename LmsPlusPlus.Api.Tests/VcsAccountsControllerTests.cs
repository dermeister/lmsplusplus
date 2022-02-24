using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class VcsAccountsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _author = null!;
    Infrastructure.User _solver = null!;
    Infrastructure.VcsAccount _account = null!;

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
        _app.Context.AddRange(_author, _solver);
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
        _account = new Infrastructure.VcsAccount
        {
            Name = "account",
            AccessToken = "access-token",
            UserId = _solver.Id,
            HostingProvider = provider
        };
        _app.Context.AddRange(provider, _account);
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
    public async Task GetAllAccountsUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-accounts", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllAccountsForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_author.Id.ToString(), _author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-accounts", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllAccountsSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "vcs-accounts", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteAccountUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"vcs-accounts/{_account.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteAccountForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_author.Id.ToString(), _author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"vcs-accounts/{_account.Id}", HttpMethod.Delete, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteAccountSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "vcs-accounts/0", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"vcs-accounts/{_account.Id}", HttpMethod.Delete, jwt);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
