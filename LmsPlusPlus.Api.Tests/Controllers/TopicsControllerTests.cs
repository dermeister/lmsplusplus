using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class TopicsControllerTests : IAsyncLifetime
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
    public async Task GetAllTopicsUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTopicsForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Admin.Id.ToString(), _data.Admin.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTopicsSuccess()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);
        IEnumerable<Response.Topic> topics1 = await Utils.ReadHttpResponse<IEnumerable<Response.Topic>>(responseMessage1.Result);
        IEnumerable<Response.Topic> topics2 = await Utils.ReadHttpResponse<IEnumerable<Response.Topic>>(responseMessage2.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
        Assert.Single(topics1);
        Assert.Single(topics2);
    }

    [Fact]
    public async Task CreateTopicUnauthorized()
    {
        // Arrange
        Request.CreateTopic topic = new(Name: "New topic", _data.Author.Id);
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt: null, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTopicForbidden()
    {
        // Arrange
        Request.CreateTopic topic = new(Name: "New topic", _data.AuthorWithoutTopics.Id);
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt1, topic);
        string jwt2 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt2, topic);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage2, responseMessage1);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task CreateTopicBadRequest()
    {
        // Arrange
        Request.CreateTopic topic = new(Name: null!, _data.Author.Id);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTopicSuccess()
    {
        // Arrange
        Request.CreateTopic topic = new(Name: "New topic", _data.Author.Id);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, jwt, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTopicUnauthorized()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: "New topic");
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Put, jwt: null, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTopicForbidden()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: "New topic");
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Put, jwt1, topic);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Put, jwt2, topic);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage2, responseMessage1);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task UpdateTopicBadRequest()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: null!);
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Put, jwt, topic);
        topic = new Request.UpdateTopic(Name: "New topic");
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Put, jwt, topic);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);
        Dictionary<string, IEnumerable<string>> errors1 = await Utils.GetBadRequestErrors(responseMessage1.Result);
        Dictionary<string, IEnumerable<string>> errors2 = await Utils.GetBadRequestErrors(responseMessage2.Result);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage2.Result.StatusCode);
        Assert.Single(errors1);
        Assert.Empty(errors2);
    }

    [Fact]
    public async Task UpdateTopicSuccess()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: "New topic");
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Put, jwt, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicForbidden()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Delete, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Delete, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicBadRequest()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Delete, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTopicSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage deleteTaskRequestMessage = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "topics/0", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"topics/{_data.Topic.Id}", HttpMethod.Delete, jwt);

        // Act
        await _app.Client.SendAsync(deleteTaskRequestMessage);
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
