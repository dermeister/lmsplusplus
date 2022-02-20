using System;
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

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        Infrastructure.User user1 = new()
        {
            Login = "user1",
            PasswordHash = "password1",
            FirstName = "User 1",
            LastName = "User 1",
            Role = Infrastructure.Role.Author
        };
        Infrastructure.Topic topic1 = new()
        {
            Author = user1,
            Name = "Topic 1"
        };
        _app.Context.Add(user1);
        _app.Context.Add(topic1);
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
    public async Task GetAllTopicsOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "topics", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetTopicByIdNonExistent()
    {
        // Arrange
        long nonExistentTopicId = await GetNonExistentTopicId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{nonExistentTopicId}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetTopicByIdOk()
    {
        // Arrange
        Infrastructure.Topic topic = await _app.Context.Topics.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{topic.Id}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTopicBadRequest()
    {
        // Arrange
        Infrastructure.User user = await _app.Context.Users.FirstAsync();
        Request.CreateTopic topic = new(null!, user.Id);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, topic);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
        Assert.Equal(oldTopicsCount, newTopicsCount);
    }

    [Fact]
    public async Task CreateTopicOk()
    {
        // Arrange
        Infrastructure.User user = await _app.Context.Users.FirstAsync();
        Request.CreateTopic topic = new(Name: "New topic 1", user.Id);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "topics", HttpMethod.Post, topic);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTopicsCount + 1, newTopicsCount);
    }

    [Fact]
    public async Task UpdateTopicBadRequest()
    {
        // Arrange
        Request.UpdateTopic topic = new(Name: "New topic 1");
        long nonExistentTopicId = await GetNonExistentTopicId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{nonExistentTopicId}", HttpMethod.Put, topic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTopicOk()
    {
        // Arrange
        Infrastructure.Topic databaseTopic = await _app.Context.Topics.FirstAsync();
        Request.UpdatedGroup requestTopic = new(Name: "New topic");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{databaseTopic.Id}", HttpMethod.Put, requestTopic);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteNonExistentTopicOk()
    {
        // Arrange
        long nonExistentTopicId = await GetNonExistentTopicId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{nonExistentTopicId}", HttpMethod.Delete);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTopicsCount, newTopicsCount);
    }

    [Fact]
    public async Task DeleteExistingTopicOk()
    {
        // Arrange
        Infrastructure.Topic databaseTopic = await _app.Context.Topics.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"topics/{databaseTopic.Id}", HttpMethod.Delete);
        int oldTopicsCount = await _app.Context.Topics.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTopicsCount = await _app.Context.Topics.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTopicsCount - 1, newTopicsCount);
    }

    async Task<long> GetNonExistentTopicId()
    {
        Infrastructure.Topic[] topics = await (from topic in _app.Context.Topics orderby topic.Id select topic).ToArrayAsync();
        Infrastructure.Topic? lastTopic = topics.LastOrDefault();
        if (lastTopic is null)
            return 0;
        return lastTopic.Id + 1;
    }
}
