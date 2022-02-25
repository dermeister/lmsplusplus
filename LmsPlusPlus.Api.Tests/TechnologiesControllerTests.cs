using System;
using System.Collections;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class TechnologiesControllerTests : IAsyncLifetime
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
    public async Task GetAllTechnologiesUnauthorized()
    {
        // Arrange
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt: null);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTechnologiesForbidden()
    {
        // Arrange
        string jwt = _app.JwtGenerator.Generate(_data.Admin.Id.ToString(), _data.Admin.Role.ToString());
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, responseMessage.StatusCode);
    }

    [Fact]
    public async Task GetAllTechnologiesSuccess()
    {
        // Arrange
        string jwt1 = _app.JwtGenerator.Generate(_data.Author.Id.ToString(), _data.Author.Role.ToString());
        HttpRequestMessage requestMessage1 = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt1);
        string jwt2 = _app.JwtGenerator.Generate(_data.Solver.Id.ToString(), _data.Solver.Role.ToString());
        HttpRequestMessage requestMessage2 = Utils.CreateHttpRequestMessage(url: "technologies", HttpMethod.Get, jwt2);

        // Act
        Task<HttpResponseMessage> responseMessage1 = _app.Client.SendAsync(requestMessage1);
        Task<HttpResponseMessage> responseMessage2 = _app.Client.SendAsync(requestMessage2);
        await Task.WhenAll(responseMessage1, responseMessage2);
        IEnumerable<Response.Technology> technologies1 =
            await Utils.ReadHttpResponse<IEnumerable<Response.Technology>>(responseMessage1.Result);
        IEnumerable<Response.Technology> technologies2 =
            await Utils.ReadHttpResponse<IEnumerable<Response.Technology>>(responseMessage2.Result);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage1.Result.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseMessage2.Result.StatusCode);
        Assert.Single(technologies1);
        Assert.Single(technologies2);
    }
}
