using System.Text;
using Docker.DotNet;
using Docker.DotNet.Models;

namespace LmsPlusPlus.Runtime;

public sealed class Service : IAsyncDisposable
{
    static int _nextId;
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task _buildContainerImageTask;
    Task<MultiplexedStream>? _startContainerTask;
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
        _buildContainerImageTask = BuildContainerImage();
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    public async Task<ServiceOutput?> ReadAsync()
    {
        Task<JSONMessage?> readBuildImageProgressTask = _buildImageProgressReader.ReadAsync();
        await Task.WhenAny(_buildContainerImageTask, readBuildImageProgressTask);
        JSONMessage? message = null;
        if (readBuildImageProgressTask.IsCompletedSuccessfully)
            message = readBuildImageProgressTask.Result;
        if (message is not null)
            return new ServiceOutput(ServiceOutputStage.Build, message.ToString()!);
        else
            try
            {
                await _containerStreamSemaphore.WaitAsync();
                _startContainerTask ??= StartContainer();
                MultiplexedStream containerStream = await _startContainerTask;
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
        await _buildContainerImageTask;
        try
        {
            await _containerStreamSemaphore.WaitAsync();
            _startContainerTask ??= StartContainer();
            MultiplexedStream containerStream = await _startContainerTask;
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
        int result = _nextId;
        Interlocked.Increment(ref _nextId);
        return result;
    }

    async Task BuildContainerImage()
    {
        await Task.CompletedTask;
        _buildImageProgressReader.Dispose();
    }

    async Task<MultiplexedStream> StartContainer()
    {
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
        MultiplexedStream containerStream = await _dockerClient.Containers.AttachContainerAsync(createContainerResponse.ID,
            tty: false, containerAttachParameters);
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
