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
        string jwt = _app.JwtGenerator.Generate(_data.Admin.Id.ToString(), _data.Admin.Role.ToString());
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
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
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
        Assert.Single(tasks1);
        Assert.Single(tasks2);
    }

    [Fact]
    public async Task CreateTaskUnauthorized()
    {
        // Arrange
        Request.CreateTask task = new(Title: "New title", Description: "New title", _data.Topic.Id, new[] { _data.Technology.Id });
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
        Request.CreateTask task = new(Title: "New task", Description: "New task", _data.Topic.Id, new[] { _data.Technology.Id });
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt1, task);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
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
        Request.CreateTask task = new(null!, Description: "New task", _data.Topic.Id, new[] { _data.Technology.Id });
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);
        task = new Request.CreateTask(Title: "New task", null!, _data.Topic.Id, new[] { _data.Technology.Id });
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);
        task = new Request.CreateTask(Title: "New task", Description: "New task", TopicId: 0, new[] { _data.Technology.Id });
        HttpRequestMessage requestMessage3 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);
        task = new Request.CreateTask(Title: "New task", Description: "New task", _data.Topic.Id, Array.Empty<short>());
        HttpRequestMessage requestMessage4 = Utils.CreateHttpRequestMessage(url: "tasks", HttpMethod.Post, jwt, task);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        Task<HttpResponseMessage> responseMessage3 = _app.Client.SendAsync(requestMessage3);
        Task<HttpResponseMessage> responseMessage4 = _app.Client.SendAsync(requestMessage4);
        await Task.WhenAll(responseMessage1, responseMessage2, responseMessage3, responseMessage4);
        Dictionary<string, IEnumerable<string>> errors1 = await Utils.GetBadRequestErrors(responseMessage1.Result);
        Dictionary<string, IEnumerable<string>> errors2 = await Utils.GetBadRequestErrors(responseMessage2.Result);
        Dictionary<string, IEnumerable<string>> errors3 = await Utils.GetBadRequestErrors(responseMessage3.Result);
        Dictionary<string, IEnumerable<string>> errors4 = await Utils.GetBadRequestErrors(responseMessage4.Result);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage2.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage3.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage4.Result.StatusCode);
        Assert.Single(errors1);
        Assert.Single(errors2);
        Assert.Single(errors3);
        Assert.Single(errors4);
    }

    [Fact]
    public async Task CreateTaskSuccess()
    {
        // Arrange
        Request.CreateTask task = new(Title: "New task", Description: "New task", _data.Topic.Id, new[] { _data.Technology.Id });
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
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
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _data.Technology.Id });
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt: null, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateTaskForbidden()
    {
        // Arrange
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _data.Technology.Id });
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt1, task);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt2, task);

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
        Request.UpdateTask task = new(null!, Description: "New task", new[] { _data.Technology.Id });
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt, task);
        task = new Request.UpdateTask(Title: "New task", null!, new[] { _data.Technology.Id });
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt, task);
        task = new Request.UpdateTask(Title: "New task", Description: "New task", Array.Empty<short>());
        HttpRequestMessage requestMessage3 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt, task);
        task = new Request.UpdateTask(Title: "New task", Description: "New task", new[] { _data.Technology.Id });
        HttpRequestMessage requestMessage4 = Utils.CreateHttpRequestMessage(url: "tasks/0", HttpMethod.Put, jwt, task);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        Task<HttpResponseMessage> responseMessage3 = _app.Client.SendAsync(requestMessage3);
        Task<HttpResponseMessage> responseMessage4 = _app.Client.SendAsync(requestMessage4);
        await Task.WhenAll(responseMessage1, responseMessage2, responseMessage3, responseMessage4);
        Dictionary<string, IEnumerable<string>> errors1 = await Utils.GetBadRequestErrors(responseMessage1.Result);
        Dictionary<string, IEnumerable<string>> errors2 = await Utils.GetBadRequestErrors(responseMessage2.Result);
        Dictionary<string, IEnumerable<string>> errors3 = await Utils.GetBadRequestErrors(responseMessage3.Result);
        Dictionary<string, IEnumerable<string>> errors4 = await Utils.GetBadRequestErrors(responseMessage4.Result);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage2.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage3.Result.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage4.Result.StatusCode);
        Assert.Single(errors1);
        Assert.Single(errors2);
        Assert.Single(errors3);
        Assert.Empty(errors4);
    }

    [Fact]
    public async Task UpdateTaskSuccess()
    {
        // Arrange
        Infrastructure.Technology newTechnology = new()
        {
            Name = "New technology",
            TemplateRepository = _data.TemplateRepository
        };
        _app.Context.Add(newTechnology);
        await _app.Context.SaveChangesAsync();
        Request.UpdateTask task = new(Title: "New task", Description: "New task", new[] { _data.Technology.Id, newTechnology.Id });
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Put, jwt, task);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTaskUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Delete, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteTaskForbidden()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Delete, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.AuthorWithoutTopics.Id.ToString(), _data.AuthorWithoutTopics.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Delete, jwt2);

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
        string jwt = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "tasks/0", HttpMethod.Delete, jwt);
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage($"tasks/{_data.Task.Id}", HttpMethod.Delete, jwt);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
    }
}
