using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class GroupsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _solver1 = null!;
    Infrastructure.User _author1 = null!;
    Infrastructure.User _author2 = null!;
    Infrastructure.Topic _topic1 = null!;
    Infrastructure.Group _group1 = null!;
    Infrastructure.Group _group2 = null!;
    Infrastructure.Group _group3 = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _author1 = new Infrastructure.User
        {
            Login = "author1",
            PasswordHash = "author1",
            FirstName = "Author 1",
            LastName = "Author 1",
            Role = Infrastructure.Role.Author
        };
        _topic1 = new Infrastructure.Topic
        {
            Author = _author1,
            Name = "Topic 1"
        };
        _group1 = new Infrastructure.Group
        {
            Name = "Group 1",
            Topic = _topic1
        };
        _group2 = new Infrastructure.Group
        {
            Name = "Group 2",
            Topic = _topic1
        };
        _author2 = new Infrastructure.User
        {
            Login = "author2",
            PasswordHash = "author2",
            FirstName = "Author 2",
            LastName = "Author 2",
            Role = Infrastructure.Role.Author
        };
        Infrastructure.Topic topic2 = new()
        {
            Name = "Topic 2",
            Author = _author2
        };
        _group3 = new Infrastructure.Group
        {
            Name = "Group 3",
            Topic = topic2
        };
        _solver1 = new Infrastructure.User
        {
            Login = "user1",
            PasswordHash = "user1",
            FirstName = "User 1",
            LastName = "User 1",
            Role = Infrastructure.Role.Solver,
            Groups = new[] { _group1 }
        };
        _app.Context.AddRange(_author1, _author2, _solver1, _topic1, topic2, _group1, _group2, _group3);
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
    public async Task GetAllGroupsError()
    {
        // Arrange
        HttpRequestMessage unauthorizedRequestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage unauthorizedResponseMessage = await _app.Client.SendAsync(unauthorizedRequestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllGroupsSuccess()
    {
        // Arrange
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage authorRequestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, authorJwt);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage solverRequestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get, solverJwt);

        // Act
        Task<HttpResponseMessage> authorResponseMessage = _app.Client.SendAsync(authorRequestMessage);
        Task<HttpResponseMessage> solverResponseMessage = _app.Client.SendAsync(solverRequestMessage);
        await Task.WhenAll(authorResponseMessage, solverResponseMessage);
        IEnumerable<Response.Group> authorGroups =
            await Utils.ReadHttpResponse<IEnumerable<Response.Group>>(authorResponseMessage.Result);
        IEnumerable<Response.Group> solverGroups =
            await Utils.ReadHttpResponse<IEnumerable<Response.Group>>(solverResponseMessage.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, authorResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, solverResponseMessage.Result.StatusCode);
        Assert.Equal(expected: 2, authorGroups.Count());
        Assert.Single(solverGroups);
    }

    [Fact]
    public async Task CreateGroupError()
    {
        // Arrange
        Request.CreatedGroup group = new(null!, TopicId: 0);
        HttpRequestMessage unauthorizedRequestMessage =
            Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt: null, group);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage forbiddenRequestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, solverJwt, group);
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage badRequestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, authorJwt, group);
        int oldGroupsCount = await _app.Context.Groups.CountAsync();

        // Act
        Task<HttpResponseMessage> unauthorizedResponseMessage = _app.Client.SendAsync(unauthorizedRequestMessage);
        Task<HttpResponseMessage> forbiddenResponseMessage = _app.Client.SendAsync(forbiddenRequestMessage);
        Task<HttpResponseMessage> badRequestResponseMessage = _app.Client.SendAsync(badRequestMessage);
        await Task.WhenAll(unauthorizedResponseMessage, badRequestResponseMessage, forbiddenResponseMessage);
        int newGroupsCount = await _app.Context.Groups.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badRequestResponseMessage.Result.StatusCode);
        Assert.Equal(oldGroupsCount, newGroupsCount);
    }

    [Fact]
    public async Task CreateGroupOk()
    {
        // Arrange
        Request.CreatedGroup group = new(Name: "New group 1", _topic1.Id);
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, jwt, group);
        int oldGroupsCount = await _app.Context.Groups.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newGroupsCount = await _app.Context.Groups.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldGroupsCount + 1, newGroupsCount);
    }

    [Fact]
    public async Task UpdateGroupBadRequest()
    {
        // Arrange
        Request.UpdatedGroup group = new(Name: "New group");
        HttpRequestMessage unauthorizedRequestMessage =
            Utils.CreateHttpRequestMessage(url: "groups/0", HttpMethod.Put, jwt: null, group);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage forbiddenRoleRequestMessage =
            Utils.CreateHttpRequestMessage(url: "groups/0", HttpMethod.Put, solverJwt, group);
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage badRequestMessage = Utils.CreateHttpRequestMessage(url: "groups/0", HttpMethod.Put, authorJwt, group);
        HttpRequestMessage forbiddenAuthorRequestMessage =
            Utils.CreateHttpRequestMessage($"groups/{_group3.Id}", HttpMethod.Put, authorJwt, group);

        // Act
        Task<HttpResponseMessage> unauthorizedResponseMessage = _app.Client.SendAsync(unauthorizedRequestMessage);
        Task<HttpResponseMessage> forbiddenRoleResponseMessage = _app.Client.SendAsync(forbiddenRoleRequestMessage);
        Task<HttpResponseMessage> badRequestResponseMessage = _app.Client.SendAsync(badRequestMessage);
        Task<HttpResponseMessage> forbiddenAuthorResponseMessage = _app.Client.SendAsync(forbiddenAuthorRequestMessage);
        await Task.WhenAll(unauthorizedResponseMessage, badRequestResponseMessage, forbiddenRoleResponseMessage,
            forbiddenAuthorResponseMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenRoleResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badRequestResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenAuthorResponseMessage.Result.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupOk()
    {
        // Arrange
        Request.UpdatedGroup group = new(Name: "New group");
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_group1.Id}", HttpMethod.Put, jwt, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteGroupUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_group1.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteGroupForbidden()
    {
        // Arrange
        string solver1Jwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"groups/{_group1.Id}", HttpMethod.Delete, solver1Jwt);
        string author2Jwt = _app.JwtGenerator.Generate(_author2.Id.ToString(), _author2.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"groups/{_group1.Id}", HttpMethod.Delete, author2Jwt);

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
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"groups/{_group1.Id}", HttpMethod.Delete, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
