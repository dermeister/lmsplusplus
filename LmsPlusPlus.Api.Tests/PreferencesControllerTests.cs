using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class PreferencesControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        Infrastructure.User user1 = new()
        {
            Login = "user1",
            PasswordHash = "password1",
            FirstName = "User 1",
            LastName = "User 1",
            Role = Infrastructure.Role.Solver
        };
        Infrastructure.Preferences preferences1 = new()
        {
            Theme = "Dark",
            User = user1
        };
        _app.Context.Add(user1);
        _app.Context.Add(preferences1);
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
    public async Task GetPreferences()
    {
        // Arrange
        Infrastructure.User user = await _app.Context.Users.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"preferences/{user.Id}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdatePreferencesBadRequest()
    {
        // Arrange
        Infrastructure.User user = await _app.Context.Users.FirstAsync();
        Request.Preferences preferences = new(null!);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"preferences/{user.Id}", HttpMethod.Put, preferences);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdatePreferencesOk()
    {
        // Arrange
        Infrastructure.User user = await _app.Context.Users.FirstAsync();
        Request.Preferences preferences = new(Theme: "Light");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"preferences/{user.Id}", HttpMethod.Put, preferences);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
