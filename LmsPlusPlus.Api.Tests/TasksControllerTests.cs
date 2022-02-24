using System;
using System.Collections;
using System.Collections.Generic;
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
    Infrastructure.User _author1 = null!;
    Infrastructure.User _author2 = null!;
    Infrastructure.User _solver = null!;
    Infrastructure.User _admin = null!;
    Infrastructure.Topic _topic1 = null!;
    Infrastructure.Technology _technology1 = null!;
    Infrastructure.Technology _technology2 = null!;
    Infrastructure.Task _task1 = null!;

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
        _author2 = new Infrastructure.User
        {
            Login = "author2",
            PasswordHash = "author2",
            FirstName = "Author 2",
            LastName = "Author 2",
            Role = Infrastructure.Role.Author
        };
        _solver = new Infrastructure.User
        {
            Login = "solver",
            PasswordHash = "solver",
            FirstName = "Solver",
            LastName = "Solver",
            Role = Infrastructure.Role.Solver
        };
        _admin = new Infrastructure.User
        {
            Login = "admin",
            PasswordHash = "admin",
            FirstName = "Admin",
            LastName = "Admin",
            Role = Infrastructure.Role.Admin
        };
        _app.Context.AddRange(_author1, _author2, _solver, _admin);
        try
        {
            await _app.Context.SaveChangesAsync();
        }
        catch (Exception)
        {
            await _app.DisposeAsync();
            throw;
        }
        _topic1 = new Infrastructure.Topic
        {
            Name = "Topic",
            Author = _author1
        };
        Infrastructure.Topic topic2 = new()
        {
            Name = "Topic 2",
            Author = _author2
        };
        Infrastructure.Group group = new()
        {
            Topic = _topic1,
            Name = "Group",
            Users = new[] { _solver }
        };
        Infrastructure.VcsHostingProvider provider = new()
        {
            Id = "provider",
            Name = "Provider"
        };
        Infrastructure.VcsAccount account = new()
        {
            Name = "account",
            AccessToken = "token",
            HostingProvider = provider,
            UserId = _admin.Id
        };
        Infrastructure.Repository repository1 = new()
        {
            VcsAccount = account,
            Url = "repository-1"
        };
        Infrastructure.Repository repository2 = new()
        {
            VcsAccount = account,
            Url = "repository-2"
        };
        _technology1 = new Infrastructure.Technology
        {
            Name = "Technology 1",
            TemplateRepository = repository1
        };
        _technology2 = new Infrastructure.Technology
        {
            Name = "Technology 2",
            TemplateRepository = repository2
        };
        _task1 = new Infrastructure.Task
        {
            Title = "Task 1",
            Description = "Task 1",
            Topic = _topic1,
            Technologies = new[] { _technology1 }
        };
        Infrastructure.Task task2 = new()
        {
            Title = "Task 2",
            Description = "Task 2",
            Topic = _topic1,
            Technologies = new[] { _technology1 }
        };
        Infrastructure.Task task3 = new()
        {
            Title = "Task 3",
            Description = "Task 3",
            Topic = topic2,
            Technologies = new[] { _technology1 }
        };
        _app.Context.AddRange(_topic1, topic2, group, provider, account, repository1, _technology1, _technology2, _task1, task2, task3);
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
    public async Task GetAllTasksUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTasksForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_admin.Id.ToString(), _admin.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTasksSuccess()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);
        IEnumerable<Response.Task> tasks1 = await Utils.ReadHttpResponse<IEnumerable<Response.Task>>(responseMessage1.Result);
        IEnumerable<Response.Task> tasks2 = await Utils.ReadHttpResponse<IEnumerable<Response.Task>>(responseMessage2.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
        Assert.Equal(expected: 2, tasks2.Count());
        Assert.Equal(expected: 2, tasks1.Count());
    }

    [Fact]
    public async Task CreateTaskUnauthorized()
    {
        // Arrange
        Request.CreateTask task = new(Title: "New title", Description: "New title", _topic1.Id, new[] { _technology1.Id });
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt: null, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTaskForbidden()
    {
        // Arrange
        Request.CreateTask task = new(Title: "New task", Description: "New task", _topic1.Id, new[] { _technology1.Id });
        string jwt1 = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt1, task);
        string jwt2 = _app.JwtGenerator.Generate(_author2.Id.ToString(), _author2.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt2, task);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task CreateTaskBadRequest()
    {
        // Arrange
        Request.CreateTask task = new(null!, null!, _topic1.Id, new[] { _technology1.Id });
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateTaskSuccess()
    {
        // Arrange
        Request.CreateTask task = new(Title: "New task", Description: "New task", _topic1.Id, new[] { _technology1.Id });
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskUnauthorized()
    {
        // Arrange
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _technology1.Id });
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Put, jwt: null, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskForbidden()
    {
        // Arrange
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _technology1.Id });
        string jwt1 = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Put, jwt1, task);
        string jwt2 = _app.JwtGenerator.Generate(_author2.Id.ToString(), _author2.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Put, jwt2, task);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskBadRequest()
    {
        // Arrange
        Request.UpdateTask task = new(null!, null!, new[] { _technology1.Id });
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Put, jwt, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskSuccess()
    {
        // Arrange
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _technology1.Id, _technology2.Id });
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Put, jwt, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTaskUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTaskForbidden()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_solver.Id.ToString(), _solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Delete, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_author2.Id.ToString(), _author2.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Delete, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage2.Result.StatusCode);
    }

    [Fact]
    public async Task DeleteTaskSuccess()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_author1.Id.ToString(), _author1.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks/0", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_task1.Id}", HttpMethod.Delete, jwt);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
