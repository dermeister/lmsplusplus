using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class PermissionsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;

    public Task InitializeAsync()
    {
        _app = new WebApplication();
        return Task.CompletedTask;
    }

    public async Task DisposeAsync() => await _app.DisposeAsync();

    [Fact]
    public async Task GetAllPermissionsOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "permissions", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetPermissionsByNonExistentRoleOk()
    {
        // Arrange
        string nonExistentRole = GetNonExistentRole();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"permissions/{nonExistentRole}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetPermissionsByRoleOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "permissions/admin", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdatePermissionsBadRequest()
    {
        // Arrange
        Request.Permissions permissions = new(CanCreateTask: false, CanUpdateTask: false, CanDeleteTask: false,
            CanUpdateVcsConfiguration: false, CanUpdateUser: false, CanCreateSolution: false, CanDeleteSolution: false);
        string nonExistentRole = GetNonExistentRole();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"permissions/{nonExistentRole}", HttpMethod.Put,
            permissions);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdatePermissionsOk()
    {
        // Arrange
        Request.Permissions permissions = new(CanCreateTask: false, CanUpdateTask: false, CanDeleteTask: false,
            CanUpdateVcsConfiguration: false, CanUpdateUser: false, CanCreateSolution: false, CanDeleteSolution: false);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "permissions/admin", HttpMethod.Put, permissions);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    static string GetNonExistentRole() => "non-existent-role";
}
