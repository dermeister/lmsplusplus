using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public sealed class UsersControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        DatabaseModels.User user1 = new()
        {
            Login = "user1",
            PasswordHash = "password1",
            FirstName = "User 1",
            LastName = "User 1",
            Role = DatabaseModels.Role.Solver
        };
        _app.Context.Add(user1);
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
    public async Task GetAllUsersOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "users", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateUserBadRequest()
    {
        // Arrange
        RequestModels.User user = new(Login: "test", null!, null!, null!);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "users", HttpMethod.Post, user);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateUserOk()
    {
        // Arrange
        RequestModels.User user = new(Login: "test", Password: "test", FirstName: "test", LastName: "test");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "users", HttpMethod.Post, user);
        int oldUsersCount = await _app.Context.Users.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newUsersCount = await _app.Context.Users.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldUsersCount + 1, newUsersCount);
    }

    [Fact]
    public async Task UpdateUserBadRequest()
    {
        // Arrange
        RequestModels.User user = new(Login: "test", null!, null!, null!);
        long nonExistentId = await GetNonExistentUserId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"users/{nonExistentId}", HttpMethod.Put, user);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateUserOk()
    {
        // Arrange
        DatabaseModels.User databaseUser = await _app.Context.Users.FirstAsync();
        RequestModels.User requestUser = new(databaseUser.Login, databaseUser.PasswordHash, FirstName: "User 2", LastName: "User 2");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"users/{databaseUser.Id}", HttpMethod.Put, requestUser);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteNonExistentUserOk()
    {
        // Arrange
        long nonExistentUserId = await GetNonExistentUserId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"users/{nonExistentUserId}", HttpMethod.Delete);
        int oldUsersCount = await _app.Context.Users.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newUsersCount = await _app.Context.Users.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldUsersCount, newUsersCount);
    }

    [Fact]
    public async Task DeleteExistingUserOk()
    {
        // Arrange
        DatabaseModels.User user = await _app.Context.Users.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"users/{user.Id}", HttpMethod.Delete);
        int oldUsersCount = await _app.Context.Users.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newUsersCount = await _app.Context.Users.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldUsersCount - 1, newUsersCount);
    }

    async Task<long> GetNonExistentUserId()
    {
        DatabaseModels.User[] users = await (from user in _app.Context.Users orderby user.Id select user).ToArrayAsync();
        DatabaseModels.User? lastUser = users.LastOrDefault();
        if (lastUser is null)
            return 0;
        return lastUser.Id + 1;
    }
}
