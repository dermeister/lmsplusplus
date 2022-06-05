using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class AuthenticationControllerTests : IAsyncLifetime
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
    public async Task SignInBadRequest()
    {
        // Arrange
        Request.SignIn signIn = new(login: "Invalid", password: "Invalid");
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "sign-in", HttpMethod.Post, jwt: null, signIn);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task SignInSuccess()
    {
        // Arrange
        Request.SignIn signIn = new(_data.Solver.Login, TestData.SolverPassword);
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "sign-in", HttpMethod.Post, jwt: null, signIn);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
