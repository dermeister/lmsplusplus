using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Validations.Rules;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class GroupsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    // Infrastructure.User _data.Author = null!;
    // Infrastructure.User _author2 = null!;
    // Infrastructure.Topic _topic1 = null!;
    // Infrastructure.Topic _topic2 = null!;
    // Infrastructure.Group _data.Group = null!;
    // Infrastructure.User _data.Solver = null!;
    // Infrastructure.User _forbiddenAuthor = null!;
    // Infrastructure.User _admin = null!;
    TestData _data = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        // _data.Author = new Infrastructure.User
        // {
        //     Login = "author1",
        //     PasswordHash = "author1",
        //     FirstName = "Author 1",
        //     LastName = "Author 1",
        //     Role = Infrastructure.Role.Author
        // };
        // _topic1 = new Infrastructure.Topic
        // {
        //     Name = "Topic 1",
        //     Author = _data.Author
        // };
        // _data.Group = new Infrastructure.Group
        // {
        //     Name = "Group 1",
        //     Topic = _topic1
        // };
        // _topic2 = new Infrastructure.Topic
        // {
        //     Name = "Topic 2",
        //     Author = _data.Author
        // };
        // Infrastructure.Group group2 = new()
        // {
        //     Name = "Group 2",
        //     Topic = _topic2,
        // };
        // _forbiddenAuthor = new Infrastructure.User
        // {
        //     Login = "author2",
        //     PasswordHash = "author2",
        //     FirstName = "Author 2",
        //     LastName = "Author 2",
        //     Role = Infrastructure.Role.Author
        // };
        // _data.Solver = new Infrastructure.User
        // {
        //     Login = "solver",
        //     PasswordHash = "solver",
        //     FirstName = "Solver",
        //     LastName = "Solver",
        //     Role = Infrastructure.Role.Solver,
        //     Groups = new[] { _group1 }
        // };
        // _admin = new Infrastructure.User
        // {
        //     Login = "admin",
        //     PasswordHash = "admin",
        //     FirstName = "Admin",
        //     LastName = "Admin",
        //     Role = Infrastructure.Role.Admin,
        // };
        // _app.Context.AddRange(_author1, _forbiddenAuthor, _data.Solver, _topic1, topic2, _group1, group2, _admin);
        try
        {
            _data = await TestData.Create(_app.Context);
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
    public async Task GetAllGroupsUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllGroupsForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Admin.Id.ToString(), _data.Admin.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllGroupsSuccess()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);
        IEnumerable<Response.Group> groups1 =
            await Utils.ReadHttpResponse<IEnumerable<Response.Group>>(responseMessage1.Result);
        IEnumerable<Response.Group> groups2 =
            await Utils.ReadHttpResponse<IEnumerable<Response.Group>>(responseMessage2.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
        Assert.Single(groups1);
        Assert.Single(groups2);
    }

    [Fact]
    public async Task CreateGroupUnauthorized()
    {
        // Arrange
        Request.CreateGroup group = new(Name: "New group", _data.Topic.Id);
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt: null, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateGroupForbidden()
    {
        // Arrange
        Request.CreateGroup group = new(Name: "New group", _data.Topic.Id);
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt1, group);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt2, group);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task CreateGroupBadRequest()
    {
        // Arrange
        Request.CreateGroup group = new(null!, _data.Topic.Id);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateGroupSuccess()
    {
        // Arrange
        Request.CreateGroup group = new(Name: "New group", _data.Topic.Id);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupUnauthorized()
    {
        // Arrange
        Request.UpdateGroup group = new(Name: "New group");
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Put, jwt: null, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupForbidden()
    {
        // Arrange
        Request.UpdateGroup group = new(Name: "New group");
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Put, jwt1, group);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Put, jwt2, group);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupBadRequest()
    {
        // Arrange
        Request.UpdateGroup group = new(Name: null!);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "groups/0", HttpMethod.Put, jwt, group);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Put, jwt, group);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupSuccess()
    {
        // Arrange
        Request.UpdateGroup group = new(Name: "New group");
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Put, jwt, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteGroupUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteGroupForbidden()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Delete, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Delete, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task DeleteGroupSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_data.Group.Id}", HttpMethod.Delete, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
