using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class TasksControllerTests : IAsyncLifetime
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
        Infrastructure.Group group1 = new()
        {
            Name = "Group 1",
            Topic = topic1
        };
        Infrastructure.Task task1 = new()
        {
            Title = "Task 1",
            Description = "Task 1",
            Topic = topic1
        };
        _app.Context.Add(user1);
        _app.Context.Add(topic1);
        _app.Context.Add(group1);
        _app.Context.Add(task1);
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
    public async Task GetAllTasksOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetTaskByIdNonExistent()
    {
        // Arrange
        long nonExistentTaskId = await GetNonExistentTaskId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{nonExistentTaskId}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetTaskByIdOk()
    {
        // Arrange
        Infrastructure.Task task = await _app.Context.Tasks.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{task.Id}", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTaskBadRequest()
    {
        // Arrange
        Request.Task task = new(null!, null!, TopicId: 0, Array.Empty<short>());
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, task);
        int oldTasksCount = await _app.Context.Tasks.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTasksCount = await _app.Context.Tasks.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
        Assert.Equal(oldTasksCount, newTasksCount);
    }

    [Fact]
    public async Task CreateTaskOk()
    {
        // Arrange
        Infrastructure.Topic topic = await _app.Context.Topics.FirstAsync();
        Request.Task task = new(Title: "New task 1", Description: "New task 1", topic.Id, Array.Empty<short>());
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, task);
        int oldTasksCount = await _app.Context.Tasks.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTasksCount = await _app.Context.Tasks.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTasksCount + 1, newTasksCount);
    }

    [Fact]
    public async Task UpdateTaskBadRequest()
    {
        // Arrange
        Request.Task task = new(null!, null!, TopicId: 0, Array.Empty<short>());
        long nonExistentTaskId = await GetNonExistentTaskId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{nonExistentTaskId}", HttpMethod.Put, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskOk()
    {
        // Arrange
        Infrastructure.Task databaseTask = await _app.Context.Tasks.FirstAsync();
        Request.Task requestTask = new(Title: "New task 1", Description: "New task 1", databaseTask.TopicId, Array.Empty<short>());
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{databaseTask.Id}", HttpMethod.Put, requestTask);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteNonExistentTaskOk()
    {
        // Arrange
        long nonExistentTaskId = await GetNonExistentTaskId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{nonExistentTaskId}", HttpMethod.Delete);
        int oldTasksCount = await _app.Context.Tasks.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTasksCount = await _app.Context.Tasks.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTasksCount, newTasksCount);
    }

    [Fact]
    public async Task DeleteExistingTaskOk()
    {
        // Arrange
        Infrastructure.Task databaseTask = await _app.Context.Tasks.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"tasks/{databaseTask.Id}", HttpMethod.Delete);
        int oldTasksCount = await _app.Context.Tasks.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newTasksCount = await _app.Context.Tasks.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldTasksCount - 1, newTasksCount);
    }

    async Task<long> GetNonExistentTaskId()
    {
        Infrastructure.Task[] tasks = await (from task in _app.Context.Tasks orderby task.Id select task).ToArrayAsync();
        Infrastructure.Task? lastTask = tasks.LastOrDefault();
        if (lastTask is null)
            return 0;
        return lastTask.Id + 1;
    }
}
