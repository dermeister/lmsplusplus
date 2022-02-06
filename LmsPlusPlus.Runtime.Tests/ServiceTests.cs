using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Net.Sockets;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Runtime.Tests;

public class ServiceTests
{
    [Fact]
    public async Task ReadServiceBuildOutput()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", GetServiceContextPath("EchoService"));
        await using Service service = new(configuration);

        // Act
        ServiceBuildOutput? output = await service.ReadBuildOutputAsync();

        // Assert
        Assert.NotNull(output);
        Assert.Contains(expectedSubstring: "FROM alpine", output!.Text);
    }

    [Fact]
    public async Task ReadServiceRunOutput()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", GetServiceContextPath("EchoService"));
        await using Service service = new(configuration);
        await service.Start();

        // Act
        string? output1 = await TestUtils.ReadAllServiceOutput(service);
        string? output2 = await service.ReadOutputAsync();
        string? output3 = await service.ReadOutputAsync();

        // Assert
        Assert.EndsWith(expectedEndString: "Hello from service!\r\n", output1 ?? "");
        Assert.Null(output2);
        Assert.Null(output3);
    }

    [Fact]
    public async Task ServiceMethodsThrowObjectDisposedException()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", GetServiceContextPath("EchoService"));
        Service service = new(configuration);

        // Act
        await service.DisposeAsync();
        Task ReadBuildOutput() => service.ReadBuildOutputAsync();
        Task WriteInput() => service.WriteInputAsync("input\n");
        Task ReadOutput() => service.ReadOutputAsync();
        Task GetOpenedPorts() => service.GetOpenedPortsAsync();

        // Assert
        await Assert.ThrowsAsync<ObjectDisposedException>(ReadBuildOutput);
        await Assert.ThrowsAsync<ObjectDisposedException>(WriteInput);
        await Assert.ThrowsAsync<ObjectDisposedException>(ReadOutput);
        await Assert.ThrowsAsync<ObjectDisposedException>(GetOpenedPorts);
    }

    [Fact]
    public async Task ServiceMethodsThrowInvalidOperationException()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "EchoService", GetServiceContextPath("EchoService"));
        await using Service service = new(configuration);

        // Act
        Task WriteInput() => service.WriteInputAsync("input\n");
        Task ReadOutput() => service.ReadOutputAsync();
        Task GetOpenedPorts() => service.GetOpenedPortsAsync();

        // Assert
        await Assert.ThrowsAsync<InvalidOperationException>(WriteInput);
        await Assert.ThrowsAsync<InvalidOperationException>(ReadOutput);
        await Assert.ThrowsAsync<InvalidOperationException>(GetOpenedPorts);
    }

    [Fact]
    public async Task WriteToServiceStdinAndReadFromStdout()
    {
        // Arrange
        ServiceConfiguration configuration = new(name: "CatService", GetServiceContextPath("CatService"))
        {
            Stdin = true
        };
        await using Service service = new(configuration);
        await service.Start();

        // Act
        await service.WriteInputAsync("hello\n");
        string? output = await TestUtils.ReadAllServiceOutput(service);

        // Assert
        Assert.EndsWith(expectedEndString: "hello\r\nhello\r\n", output ?? "");
    }

    [Fact]
    public async Task AccessServiceViaSocket()
    {
        // Arrange
        VirtualPortMapping virtualPortMapping = new(PortType.Tcp, containerPort: 10_000, virtualHostPort: 10_000);
        ServiceConfiguration configuration = new(name: "SocketService", GetServiceContextPath("SocketService"))
        {
            VirtualPortMappings = new List<VirtualPortMapping> { virtualPortMapping }.AsReadOnly()
        };
        await using Service service = new(configuration);
        await service.Start();

        // Act
        ReadOnlyCollection<PortMapping> openedPorts = await service.GetOpenedPortsAsync();
        PortMapping portMapping = openedPorts[0];
        await Task.Delay(1000); // Wait for process in container to open socket
        using TcpClient client = TestUtils.ConnectToTcpSocket(portMapping.HostPort);
        TestUtils.WriteToTcpClient(client, message: "hello world");
        string output = TestUtils.ReadFromTcpClient(client);

        // Assert
        Assert.Single(openedPorts);
        Assert.Equal(expected: 10_000, portMapping.ContainerPort);
        Assert.Equal(expected: 10_000, portMapping.VirtualHostPort);
        Assert.Equal(expected: "hello world", output);
    }

    internal static string GetServiceContextPath(string serviceName) => Path.GetFullPath(Path.Combine(path1: "Services", serviceName));
}
