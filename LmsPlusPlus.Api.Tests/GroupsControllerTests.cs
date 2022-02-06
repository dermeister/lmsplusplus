using System;
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

    public async Task InitializeAsync()
    {
        try
        {
            _app = new WebApplication();
            DatabaseModels.User user1 = new()
            {
                Login = "user1",
                PasswordHash = "password1",
                FirstName = "User 1",
                LastName = "User 1",
                Role = DatabaseModels.Role.Author
            };
            DatabaseModels.Topic topic1 = new()
            {
                Author = user1,
                Name = "Topic 1"
            };
            DatabaseModels.Group group1 = new()
            {
                Name = "Group 1",
                Topic = topic1
            };
            _app.Context.Add(user1);
            _app.Context.Add(topic1);
            _app.Context.Add(group1);
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
    public async Task GetAllGroupsOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "groups", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetGroupByIdNonExistent()
    {
        // Arrange
        long nonExistentGroupId = await GetNonExistentGroupId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{nonExistentGroupId}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetGroupByIdOk()
    {
        // Arrange
        DatabaseModels.Group group = await _app.Context.Groups.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{group.Id}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateGroupBadRequest()
    {
        // Arrange
        RequestModels.Group group = new(null!, TopicId: 0);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, group);
        int oldGroupsCount = await _app.Context.Groups.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newGroupsCount = await _app.Context.Groups.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
        Assert.Equal(oldGroupsCount, newGroupsCount);
    }

    [Fact]
    public async Task CreateTopicOk()
    {
        // Arrange
        DatabaseModels.Topic topic = await _app.Context.Topics.FirstAsync();
        RequestModels.Group group = new(Name: "New group 1", topic.Id);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "groups", HttpMethod.Post, group);
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
        RequestModels.Group group = new(null!, TopicId: 0);
        long nonExistentGroupId = await GetNonExistentGroupId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{nonExistentGroupId}", HttpMethod.Put, group);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateGroupOk()
    {
        // Arrange
        DatabaseModels.Group databaseGroup = await _app.Context.Groups.FirstAsync();
        RequestModels.Group requestGroup = new(Name: "New group 1", databaseGroup.TopicId);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{databaseGroup.Id}", HttpMethod.Put, requestGroup);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteNonExistentGroupOk()
    {
        // Arrange
        long nonExistentGroupId = await GetNonExistentGroupId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{nonExistentGroupId}", HttpMethod.Delete);
        int oldGroupsCount = await _app.Context.Groups.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newGroupsCount = await _app.Context.Groups.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldGroupsCount, newGroupsCount);
    }

    [Fact]
    public async Task DeleteExistingGroupOk()
    {
        // Arrange
        DatabaseModels.Group databaseGroup = await _app.Context.Groups.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"groups/{databaseGroup.Id}", HttpMethod.Delete);
        int oldGroupsCount = await _app.Context.Groups.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newGroupsCount = await _app.Context.Groups.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldGroupsCount - 1, newGroupsCount);
    }

    async Task<long> GetNonExistentGroupId()
    {
        DatabaseModels.Group[] groups = await (from @group in _app.Context.Groups orderby @group.Id select @group).ToArrayAsync();
        DatabaseModels.Group? lastGroup = groups.LastOrDefault();
        if (lastGroup is null)
            return 0;
        return lastGroup.Id + 1;
    }
}
