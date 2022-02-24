using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class TopicsControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;
    Infrastructure.User _author1 = null!;
    Infrastructure.User _solver1 = null!;
    Infrastructure.User _admin1 = null!;
    Infrastructure.Topic _topic1 = null!;
    Infrastructure.Topic _topic2 = null!;

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
        Infrastructure.User author2 = new()
        {
            Login = "author2",
            PasswordHash = "author2",
            FirstName = "Author 2",
            LastName = "Author 2",
            Role = Infrastructure.Role.Author
        };
        _topic2 = new Infrastructure.Topic
        {
            Author = author2,
            Name = "Topic 2"
        };
        _solver1 = new Infrastructure.User
        {
            Login = "solver1",
            PasswordHash = "solver1",
            FirstName = "Solver 1",
            LastName = "Solver 1",
            Role = Infrastructure.Role.Solver
        };
        Infrastructure.Group group1 = new()
        {
            Topic = _topic1,
            Name = "Group 1",
            Users = new[] { _solver1 }
        };
        Infrastructure.Group group2 = new()
        {
            Topic = _topic2,
            Name = "Group 2",
            Users = new[] { _solver1 }
        };
        _admin1 = new Infrastructure.User
        {
            Login = "admin1",
            PasswordHash = "admin1",
            FirstName = "Admin 1",
            LastName = "Admin 1",
            Role = Infrastructure.Role.Admin
        };
        _app.Context.AddRange(_author1, author2, _solver1, _admin1, _topic1, _topic2, group1, group2);
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
    public async Task GetAllTopicsError()
    {
        // Arrange
        HttpRequestMessage unauthorizedRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, jwt: null);
        string adminJwt = _app.JwtGenerator.Generate(_admin1.Id.ToString(), _admin1.Role.ToString());
        HttpRequestMessage forbiddenRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, adminJwt);

        // Act
        Task<HttpResponseMessage> unauthorizedResponseMessage = _app.Client.SendAsync(unauthorizedRequestMessage);
        Task<HttpResponseMessage> forbiddenResponseMessage = _app.Client.SendAsync(forbiddenRequestMessage);
        await Task.WhenAll(unauthorizedResponseMessage, forbiddenResponseMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenResponseMessage.Result.StatusCode);
    }

    [Fact]
    public async Task GetAllTopicsSuccess()
    {
        // Arrange
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage authorRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, authorJwt);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage solverRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, solverJwt);

        // Act
        Task<HttpResponseMessage> authorResponseMessage = _app.Client.SendAsync(authorRequestMessage);
        Task<HttpResponseMessage> solverResponseMessage = _app.Client.SendAsync(solverRequestMessage);
        await Task.WhenAll(authorResponseMessage, solverResponseMessage);
        IEnumerable<Response.Topic> authorTopics =
            await Utils.ReadHttpResponse<IEnumerable<Response.Topic>>(authorResponseMessage.Result);
        IEnumerable<Response.Topic> solverTopics =
            await Utils.ReadHttpResponse<IEnumerable<Response.Topic>>(solverResponseMessage.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, authorResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, solverResponseMessage.Result.StatusCode);
        Assert.Single(authorTopics);
        Assert.Equal(expected: 2, solverTopics.Count());
    }

    [Fact]
    public async Task CreateTopicError()
    {
        // Arrange
        Request.CreateTopic topic = new(null!, _author1.Id);
        HttpRequestMessage unauthorizedRequestMessage =
            Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt: null, topic);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage forbiddenRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, solverJwt, topic);
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage badRequestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, authorJwt, topic);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        Task<HttpResponseMessage> unauthorizedResponseMessage = _app.Client.SendAsync(unauthorizedRequestMessage);
        Task<HttpResponseMessage> forbiddenResponseMessage = _app.Client.SendAsync(forbiddenRequestMessage);
        Task<HttpResponseMessage> badRequestResponseMessage = _app.Client.SendAsync(badRequestMessage);
        await Task.WhenAll(unauthorizedResponseMessage, badRequestResponseMessage, forbiddenResponseMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badRequestResponseMessage.Result.StatusCode);
        Assert.Equal(oldTopicsCount, newTopicsCount);
    }

    [Fact]
    public async Task CreateTopicOk()
    {
        // Arrange
        Request.CreateTopic topic = new(Name: "New topic 1", _author1.Id);
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt, topic);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTopicsCount + 1, newTopicsCount);
    }

    [Fact]
    public async Task UpdateTopicError()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: "New topic 1");
        HttpRequestMessage unauthorizedRequestMessage =
            Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Put, jwt: null, topic);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage forbiddenRoleRequestMessage =
            Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Put, solverJwt, topic);
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage badRequestMessage = Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Put, authorJwt, topic);
        HttpRequestMessage forbiddenAuthorRequestMessage =
            Utils.CreateHttpRequestMessage($"topics/{_topic2.Id}", HttpMethod.Put, authorJwt, topic);

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
    public async Task UpdateTopicOk()
    {
        // Arrange
        Request.UpdatedGroup requestTopic = new(Name: "New topic");
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"topics/{_topic1.Id}", HttpMethod.Put, jwt, requestTopic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicError()
    {
        // Arrange
        HttpRequestMessage unauthorizedRequestMessage =
            Utils.CreateHttpRequestMessage($"topics/{_topic1.Id}", HttpMethod.Delete, jwt: null);
        string solverJwt = _app.JwtGenerator.Generate(_solver1.Id.ToString(), _solver1.Role.ToString());
        HttpRequestMessage forbiddenRoleRequestMessage =
            Utils.CreateHttpRequestMessage($"topics/{_topic1.Id}", HttpMethod.Delete, solverJwt);
        string authorJwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage forbiddenAuthorRequestMessage =
            Utils.CreateHttpRequestMessage($"topics/{_topic2.Id}", HttpMethod.Delete, authorJwt);

        // Act
        Task<HttpResponseMessage> unauthorizedResponseMessage = _app.Client.SendAsync(unauthorizedRequestMessage);
        Task<HttpResponseMessage> forbiddenRoleResponseMessage = _app.Client.SendAsync(forbiddenRoleRequestMessage);
        Task<HttpResponseMessage> forbiddenAuthorResponseMessage = _app.Client.SendAsync(forbiddenAuthorRequestMessage);
        await Task.WhenAll(unauthorizedResponseMessage, forbiddenRoleResponseMessage, forbiddenAuthorResponseMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorizedResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenRoleResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenAuthorResponseMessage.Result.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicOk()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage deleteByNonExistentIdRequestMessage =
            Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Delete, jwt);
        HttpRequestMessage deleteByExistingIdRequestMessage =
            Utils.CreateHttpRequestMessage($"topics/{_topic1.Id}", HttpMethod.Delete, jwt);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        Task<HttpResponseMessage> deleteByNonExistentIdResponseMessage = _app.Client.SendAsync(deleteByNonExistentIdRequestMessage);
        Task<HttpResponseMessage> deleteByExistingIdResponseMessage = _app.Client.SendAsync(deleteByExistingIdRequestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, deleteByNonExistentIdResponseMessage.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, deleteByExistingIdResponseMessage.Result.StatusCode);
        Assert.Equal(oldTopicsCount, newTopicsCount);
    }
}
