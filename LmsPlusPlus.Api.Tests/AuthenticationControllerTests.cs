using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class AuthenticationControllerTests : IAsyncLifetime
{
    const string Password = "Password";
    WebApplication _app = null!;
    Infrastructure.User _user = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        _user = new Infrastructure.User
        {
            Login = "user",
            PasswordHash = Password,
            FirstName = "User",
            LastName = "User",
            Role = Infrastructure.Role.Author
        };
        _app.Context.Add(_user);
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
    public async Task SignInBadRequest()
    {
        // Arrange
        Request.SignIn signIn = new(Login: "Invalid", Password: "Invalid");
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
        Request.SignIn signIn = new(_user.Login, Password);
        HttpRequestMessage requestMessage = Utils.CreateHttpRequestMessage(url: "sign-in", HttpMethod.Post, jwt: null, signIn);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }
}
