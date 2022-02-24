using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class PermissionsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _user = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _user = new Infrastructure.User
        {
            Login = "User",
            PasswordHash = "User",
            FirstName = "User",
            LastName = "User",
            Role = Infrastructure.Role.Author
        };
        _app.Context.AddRange(_user);
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
    public async Task GetPermissionsUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "permissions", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetPermissionsSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_user.Id.ToString(), _user.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "permissions", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage1);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
