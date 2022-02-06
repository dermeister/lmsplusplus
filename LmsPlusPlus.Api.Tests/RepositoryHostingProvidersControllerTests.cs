using System;
using System.Linq;
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
        DatabaseModels.RepositoryHostingProvider provider1 = new() { Name = "Provider 1" };
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
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "repository-hosting-providers", HttpMethod.Get);

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
    }

    [Fact]
    public async Task CreateProviderBadRequest()
    {
        // Arrange
        RequestModels.RepositoryHostingProvider topic = new(null!);
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "repository-hosting-providers", HttpMethod.Post, topic);
        int oldProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount, newProvidersCount);
    }

    [Fact]
    public async Task CreateProviderOk()
    {
        // Arrange
        RequestModels.RepositoryHostingProvider topic = new(Name: "New provider 1");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage(url: "repository-hosting-providers", HttpMethod.Post, topic);
        int oldProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount + 1, newProvidersCount);
    }

    [Fact]
    public async Task UpdateProviderBadRequest()
    {
        // Arrange
        RequestModels.RepositoryHostingProvider provider = new(Name: "New provider 1");
        long nonExistentProviderId = await GetNonExistentProviderId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"repository-hosting-providers/{nonExistentProviderId}",
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
        DatabaseModels.RepositoryHostingProvider provider = await _app.Context.RepositoryHostingProviders.FirstAsync();
        RequestModels.RepositoryHostingProvider requestProvider = new(Name: "New provider 1");
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"repository-hosting-providers/{provider.Id}",
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
        long nonExistentProviderId = await GetNonExistentProviderId();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"repository-hosting-providers/{nonExistentProviderId}",
            HttpMethod.Delete);
        int oldProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount, newProvidersCount);
    }

    [Fact]
    public async Task DeleteExistingProviderOk()
    {
        // Arrange
        DatabaseModels.RepositoryHostingProvider providers = await _app.Context.RepositoryHostingProviders.FirstAsync();
        HttpRequestMessage requestMessage = TestUtils.CreateHttpRequestMessage($"repository-hosting-providers/{providers.Id}",
            HttpMethod.Delete);
        int oldProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Act
        HttpResponseMessage responseMessage = await _app.Client.SendAsync(requestMessage);
        int newProvidersCount = await _app.Context.RepositoryHostingProviders.CountAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, responseMessage.StatusCode);
        Assert.Equal(oldProvidersCount - 1, newProvidersCount);
    }

    async Task<long> GetNonExistentProviderId()
    {
        DatabaseModels.RepositoryHostingProvider[] providers = await (from provider in _app.Context.RepositoryHostingProviders
                                                                      orderby provider.Id
                                                                      select provider).ToArrayAsync();
        DatabaseModels.RepositoryHostingProvider? lastProvider = providers.LastOrDefault();
        if (lastProvider is null)
            return 0;
        return lastProvider.Id + 1;
    }
}
