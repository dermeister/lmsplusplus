using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Runtime.Tests;

public class ServiceTests
{
    [Fact]
    public async Task ReadEchoServiceBuildOutput()
    {
        // Arrange
        await using Service service = CreateService("EchoService");

        // Act
        ServiceOutput? output = await service.ReadAsync();

        // Assert
        Assert.NotNull(output);
        Assert.Contains(expectedSubstring: "FROM alpine", output!.Content);
    }

    [Fact]
    public async Task ReadEchoServiceRunOutput()
    {
        // Arrange
        await using Service service = CreateService("EchoService");

        // Act
        string? output = await ReadServiceRunOutput(service);

        // Assert
        Assert.Equal(expected: "Hello from service!\n", output);
    }

    [Fact]
    public async Task ServiceMethodsThrowObjectDisposedException()
    {
        // Arrange
        Service service = CreateService("EchoService");

        // Act
        await service.DisposeAsync();
        Task Write() => service.WriteAsync("input");
        Task Read() => service.ReadAsync();

        // Assert
        await Assert.ThrowsAsync<ObjectDisposedException>(Write);
        await Assert.ThrowsAsync<ObjectDisposedException>(Read);
    }

    [Fact]
    public async Task ConcurrentDisposeDoesNotThrowException()
    {
        // Arrange
        Service service = CreateService("EchoService");

        // Act
        Task t1 = service.DisposeAsync().AsTask();
        Task t2 = service.DisposeAsync().AsTask();
        await Task.WhenAll(t1, t2);

        // Assert
        Assert.True(condition: true, userMessage: "No exception has been thrown");
    }

    static async Task<string?> ReadServiceRunOutput(Service service)
    {
        ServiceOutput? output;
        do
            output = await service.ReadAsync();
        while (output?.Stage is ServiceOutputStage.Build);
        return output?.Content;
    }

    static Service CreateService(string servicePath)
    {
        string serviceContextPath = Path.Combine(path1: "Services", servicePath);
        var serviceName = Guid.NewGuid().ToString();
        return new Service(new ServiceConfiguration(serviceName, serviceContextPath));
    }
}
