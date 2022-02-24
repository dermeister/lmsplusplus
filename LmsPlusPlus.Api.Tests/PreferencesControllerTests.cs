using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class PreferencesControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _user = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _user = new Infrastructure.User
        {
            Login = "user",
            PasswordHash = "user",
            FirstName = "User",
            LastName = "User",
            Role = Infrastructure.Role.Author
        };
        _app.Context.Add(_user);
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
    public async Task GetPreferencesUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "preferences", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetPreferencesSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_user.Id.ToString(), _user.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"preferences", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
