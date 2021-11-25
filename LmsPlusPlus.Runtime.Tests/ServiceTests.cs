using System;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Runtime.Tests;

public class ServiceTests
{
    [Fact]
    public async Task ReadServiceBuildOutput()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", TestUtils.GetContextPath("EchoService"));
        await using Service service = new(configuration);

        // Act
        ServiceOutput? output = await service.ReadAsync();

        // Assert
        Assert.NotNull(output);
        Assert.Contains(expectedSubstring: "FROM alpine", output!.Content);
    }

    [Fact]
    public async Task ReadServiceRunOutput()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", TestUtils.GetContextPath("EchoService"));
        await using Service service = new(configuration);

        // Act
        string? output = await TestUtils.ReadServiceRunOutput(service);

        // Assert
        Assert.Equal(expected: "Hello from service!\n", output);
    }

    [Fact]
    public async Task ServiceMethodsThrowObjectDisposedException()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", TestUtils.GetContextPath("EchoService"));
        Service service = new(configuration);

        // Act
        await service.DisposeAsync();
        Task Write() => service.WriteAsync("input");
        Task Read() => service.ReadAsync();
        Task GetPorts() => service.GetPortMappingsAsync();

        // Assert
        await Assert.ThrowsAsync<ObjectDisposedException>(Write);
        await Assert.ThrowsAsync<ObjectDisposedException>(Read);
        await Assert.ThrowsAsync<ObjectDisposedException>(GetPorts);
    }

    [Fact]
    public async Task WriteToServiceStdinAndReadFromStdout()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "CatService", TestUtils.GetContextPath("CatService"))
        {
            Stdin = true
        };
        await using Service service = new(configuration);

        // Act
        await service.WriteAsync("hello");
        string? output1 = await TestUtils.ReadServiceRunOutput(service);
        await service.WriteAsync("world");
        string? output2 = await TestUtils.ReadServiceRunOutput(service);

        // Assert
        Assert.Equal(expected: "hello", output1);
        Assert.Equal(expected: "world", output2);
    }
}
