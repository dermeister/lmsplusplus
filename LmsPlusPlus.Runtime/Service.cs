using System.Text;
using Docker.DotNet;
using Docker.DotNet.Models;

namespace LmsPlusPlus.Runtime;

public sealed class Service : IAsyncDisposable
{
    static int s_nextId;
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task<MultiplexedStream> _buildImageAndStartContainerTask;
    readonly Progress<JSONMessage> _buildImageProgress;
    readonly ProgressReader<JSONMessage> _buildImageProgressReader;
    readonly SemaphoreSlim _containerStreamSemaphore = new(initialCount: 1);

    public int Id { get; }

    internal Service(ServiceConfiguration configuration)
    {
        Id = GenerateId();
        _configuration = configuration;
        _buildImageProgress = new Progress<JSONMessage>();
        _buildImageProgressReader = new ProgressReader<JSONMessage>(_buildImageProgress);
        _buildImageAndStartContainerTask = BuildImageAndStartContainer();
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    public async Task<ServiceOutput?> ReadAsync()
    {
        JSONMessage? message = await _buildImageProgressReader.ReadAsync();
        if (message is not null)
            return new ServiceOutput(ServiceOutputStage.Build, message.ToString()!);
        try
        {
            await _containerStreamSemaphore.WaitAsync();
            MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
            var buffer = new byte[1 << 16];
            MultiplexedStream.ReadResult readResult = await containerStream.ReadOutputAsync(buffer, offset: 0, buffer.Length,
                CancellationToken.None);
            if (readResult.EOF)
                return null;
            string content = Encoding.Default.GetString(buffer.AsSpan(start: 0, readResult.Count));
            return new ServiceOutput(ServiceOutputStage.Run, content);
        }
        finally
        {
            _containerStreamSemaphore.Release();
        }
    }

    public async Task WriteAsync(string input)
    {
        try
        {
            await _containerStreamSemaphore.WaitAsync();
            MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
            byte[] buffer = Encoding.Default.GetBytes(input);
            await containerStream.WriteAsync(buffer, offset: 0, buffer.Length, CancellationToken.None);
        }
        finally
        {
            _containerStreamSemaphore.Release();
        }
    }

    static int GenerateId()
    {
        int result = s_nextId;
        Interlocked.Increment(ref s_nextId);
        return result;
    }

    async Task<MultiplexedStream> BuildImageAndStartContainer()
    {
        try
        {
            await _dockerClient.Images.BuildImageFromDockerfileAsync(new ImageBuildParameters(), contents: null, authConfigs: null,
                headers: null, _buildImageProgress, CancellationToken.None);
        }
        finally
        {
            _buildImageProgressReader.Dispose();
        }
        CreateContainerParameters createContainerParameters = new()
        {
            Image = "ubuntu",
            AttachStdout = true,
            AttachStdin = _configuration.Stdin,
            OpenStdin = _configuration.Stdin,
            Cmd = new[] { "date" }
        };
        CreateContainerResponse createContainerResponse =
            await _dockerClient.Containers.CreateContainerAsync(createContainerParameters);
        ContainerAttachParameters containerAttachParameters = new()
        {
            Stream = true,
            Stdout = true,
            Stdin = _configuration.Stdin
        };
        MultiplexedStream containerStream =
            await _dockerClient.Containers.AttachContainerAsync(createContainerResponse.ID, tty: false, containerAttachParameters);
        bool containerStarted =
            await _dockerClient.Containers.StartContainerAsync(createContainerResponse.ID, new ContainerStartParameters());
        if (!containerStarted)
            throw new ServiceException("Unable to start container");
        return containerStream;
    }
}

public enum ServiceOutputStage
{
    Build,
    Run
}

public class ServiceOutput
{
    public ServiceOutputStage Stage { get; }
    public string Content { get; }

    public ServiceOutput(ServiceOutputStage stage, string content)
    {
        Stage = stage;
        Content = content;
    }
}

class ServiceConfiguration
{
    internal string ContextPath { get; }
    internal ushort[]? TcpPorts { get; }
    internal bool Stdin { get; }

    public ServiceConfiguration(string contextPath, ushort[]? tcpPorts, bool stdin)
    {
        ContextPath = contextPath;
        TcpPorts = tcpPorts;
        Stdin = stdin;
    }
}
