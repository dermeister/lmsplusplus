using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class PermissionsControllerTests : IAsyncLifetime
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
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "permissions", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage1);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
