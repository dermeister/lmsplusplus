using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class VcsAccountsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    TestData _data = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        try
        {
            _data = await TestData.Create(_app.Context);
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
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
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
        string jwt = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
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
        HttpRequestMessage requestMessage =
            Utils.CreateHttpRequestMessage($"vcs-accounts/{_data.Account.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteAccountForbidden()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"vcs-accounts/{_data.Account.Id}", HttpMethod.Delete, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.SolverWithoutAccounts.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"vcs-accounts/{_data.Account.Id}", HttpMethod.Delete, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task DeleteAccountSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "vcs-accounts/0", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"vcs-accounts/{_data.Account.Id}", HttpMethod.Delete, jwt);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
