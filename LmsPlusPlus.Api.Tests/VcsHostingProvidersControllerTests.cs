using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class RepositoryHostingProvidersControllerTests : IAsyncLifetime
{
    WebApplication _app = null!;

    public async Task InitializeAsync()
    {
        _app = new WebApplication();
        Infrastructure.VcsHostingProvider provider1 = new() { Name = "Provider 1" };
        _app.Context.Add(provider1);
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
    public async Task GetAllProvidersOk()
    {
        // Arrange
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateProviderBadRequest()
    {
        // Arrange
        Request.VcsHostingProvider topic = new(null!);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Post, topic);
        int oldProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount, newProvidersCount);
    }

    [Fact]
    public async Task CreateProviderOk()
    {
        // Arrange
        Request.VcsHostingProvider topic = new(Name: "New provider 1");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "vcs-hosting-providers", HttpMethod.Post, topic);
        int oldProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount + 1, newProvidersCount);
    }

    [Fact]
    public async Task UpdateProviderBadRequest()
    {
        // Arrange
        Request.VcsHostingProvider provider = new(Name: "New provider 1");
        string nonExistentProviderId = GetNonExistentProviderId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"vcs-hosting-providers/{nonExistentProviderId}",
            HttpMethod.Put, provider);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
    }

    [Fact]
    public async Task UpdateProviderOk()
    {
        // Arrange
        Infrastructure.VcsHostingProvider provider = await _app.Context.VcsHostingProviders.FirstAsync();
        Request.VcsHostingProvider requestProvider = new(Name: "New provider 1");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"vcs-hosting-providers/{provider.Id}",
            HttpMethod.Put, requestProvider);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task DeleteNonExistentProviderOk()
    {
        // Arrange
        string nonExistentProviderId = GetNonExistentProviderId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"vcs-hosting-providers/{nonExistentProviderId}",
            HttpMethod.Delete);
        int oldProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount, newProvidersCount);
    }

    [Fact]
    public async Task DeleteExistingProviderOk()
    {
        // Arrange
        Infrastructure.VcsHostingProvider providers = await _app.Context.VcsHostingProviders.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"vcs-hosting-providers/{providers.Id}",
            HttpMethod.Delete);
        int oldProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.VcsHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount - 1, newProvidersCount);
    }

    static string GetNonExistentProviderId() => "non-existent-id";
}
