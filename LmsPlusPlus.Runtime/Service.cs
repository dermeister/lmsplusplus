using System.Text;
using Docker.DotNet;
using Docker.DotNet.Models;
using ICSharpCode.SharpZipLib.Tar;

namespace LmsPlusPlus.Runtime;

public sealed class Service : IAsyncDisposable
{
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task<MultiplexedStream> _buildImageAndStartContainerTask;
    readonly Progress<JSONMessage> _buildImageProgress;
    readonly ProgressReader<JSONMessage> _buildImageProgressReader;
    readonly CancellationTokenSource _cancellationTokenSource = new();
    string? _containerId;
    bool _isDisposed;

    public string Name => _configuration.Name;

    internal Service(ServiceConfiguration configuration)
    {
        _configuration = configuration;
        _buildImageProgress = new Progress<JSONMessage>();
        _buildImageProgressReader = new ProgressReader<JSONMessage>(_buildImageProgress);
        _buildImageAndStartContainerTask = BuildImageAndStartContainer();
    }

    public async ValueTask DisposeAsync()
    {
        if (_isDisposed)
            return;
        _isDisposed = true;
        _cancellationTokenSource.Cancel();
        Task buildImageAndStartContainerCompletedTask = await _buildImageAndStartContainerTask.ContinueWith(Task.FromResult);
        await RemoveContainer();
        await RemoveImage();
        _dockerClient.Dispose();
        if (buildImageAndStartContainerCompletedTask is { IsFaulted: true, Exception: not null })
            throw buildImageAndStartContainerCompletedTask.Exception;
    }

    public async Task<ServiceOutput?> ReadAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        JSONMessage? message = await _buildImageProgressReader.ReadAsync();
        if (message is not null)
            return new ServiceOutput(ServiceOutputStage.Build, message.Stream);
        MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
        var buffer = new byte[1 << 16];
        MultiplexedStream.ReadResult readResult = await containerStream.ReadOutputAsync(buffer, offset: 0, buffer.Length,
            cancellationToken);
        if (readResult.EOF)
            return null;
        string content = Encoding.Default.GetString(buffer.AsSpan(start: 0, readResult.Count));
        return new ServiceOutput(ServiceOutputStage.Run, content);
    }

    public async Task WriteAsync(string input, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
        byte[] buffer = Encoding.Default.GetBytes(input);
        await containerStream.WriteAsync(buffer, offset: 0, buffer.Length, cancellationToken);
    }

    async Task<MultiplexedStream> BuildImageAndStartContainer()
    {
        await using Stream contents = CreateTarArchive();
        ImageBuildParameters imageBuildParameters = new() { Tags = new[] { _configuration.Name } };
        try
        {
            await _dockerClient.Images.BuildImageFromDockerfileAsync(imageBuildParameters, contents, authConfigs: null, headers: null,
                _buildImageProgress);
        }
        finally
        {
            _buildImageProgressReader.StopListeningToProgressChanges();
        }
        CreateContainerParameters createContainerParameters = new()
        {
            Image = _configuration.Name,
            AttachStdout = true,
            AttachStdin = _configuration.Stdin,
            OpenStdin = _configuration.Stdin,
        };
        CreateContainerResponse createContainerResponse = await _dockerClient.Containers.CreateContainerAsync(createContainerParameters,
            _cancellationTokenSource.Token);
        _containerId = createContainerResponse.ID;
        ContainerAttachParameters containerAttachParameters = new()
        {
            Stream = true,
            Stdout = true,
            Stdin = _configuration.Stdin
        };
        MultiplexedStream containerStream = await _dockerClient.Containers.AttachContainerAsync(createContainerResponse.ID, tty: false,
            containerAttachParameters, _cancellationTokenSource.Token);
        await _dockerClient.Containers.StartContainerAsync(createContainerResponse.ID,
            new ContainerStartParameters(), _cancellationTokenSource.Token);
        return containerStream;
    }

    Stream CreateTarArchive()
    {
        MemoryStream output = new();
        var archive = TarArchive.CreateOutputTarArchive(output);
        archive.IsStreamOwner = false;
        archive.RootPath = _configuration.ContextPath;
        foreach (string file in Directory.EnumerateFiles(_configuration.ContextPath))
        {
            var entry = TarEntry.CreateEntryFromFile(file);
            archive.WriteEntry(entry, recurse: false);
        }
        archive.Close();
        output.Position = 0;
        return output;
    }

    void EnsureNotDisposed()
    {
        if (_isDisposed)
            throw new ObjectDisposedException(nameof(Service));
    }

    async Task RemoveContainer()
    {
        if (_containerId is not null)
        {
            ContainerRemoveParameters containerRemoveParameters = new() { Force = true };
            await _dockerClient.Containers.RemoveContainerAsync(_containerId, containerRemoveParameters);
        }
    }

    async Task RemoveImage()
    {
        Dictionary<string, IDictionary<string, bool>> filters = new()
        {
            ["reference"] = new Dictionary<string, bool> { [_configuration.Name] = true }
        };
        ImagesListParameters imagesListParameters = new() { Filters = filters };
        IList<ImagesListResponse> images = await _dockerClient.Images.ListImagesAsync(imagesListParameters);
        if (images.Count > 0)
        {
            ImageDeleteParameters imageDeleteParameters = new() { Force = true };
            await _dockerClient.Images.DeleteImageAsync(_configuration.Name, imageDeleteParameters);
        }
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
    internal string Name { get; }
    internal string ContextPath { get; }
    internal ushort[]? TcpPorts { get; init; }
    internal bool Stdin { get; init; }
    internal string? NetworkName { get; init; }

    public ServiceConfiguration(string name, string contextPath)
    {
        Name = name;
        ContextPath = contextPath;
    }
}
