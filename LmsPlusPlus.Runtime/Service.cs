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
    readonly string _imageName;
    string? _containerId;
    bool _isDisposed;
    ushort[]? _tcpPorts;

    public string Name => _configuration.Name;

    internal Service(ServiceConfiguration configuration)
    {
        _configuration = configuration;
        _buildImageProgress = new Progress<JSONMessage>();
        _buildImageProgressReader = new ProgressReader<JSONMessage>(_buildImageProgress);
        _imageName = $"{_configuration.Name.ToLower()}-{Guid.NewGuid()}";
        _buildImageAndStartContainerTask = BuildImageAndStartContainer();
    }

    public async ValueTask DisposeAsync()
    {
        if (!_isDisposed)
        {
            _isDisposed = true;
            _cancellationTokenSource.Cancel();
            await _buildImageAndStartContainerTask.ContinueWith(Task.FromResult);
            await RemoveContainer();
            await RemoveImage();
            _dockerClient.Dispose();
            _cancellationTokenSource.Dispose();
        }
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

    public async Task<ushort[]?> GetTcpPorts(CancellationToken cancellationToken = default)
    {
        if (_configuration.TcpPorts is null)
            return null;
        if (_tcpPorts is not null)
            return _tcpPorts;
        await _buildImageAndStartContainerTask;
        ContainerInspectResponse containerInspectResponse = await _dockerClient.Containers.InspectContainerAsync(_containerId!,
            cancellationToken);
        _tcpPorts = (from portBindings in containerInspectResponse.NetworkSettings.Ports.Values
                     let hostPort = portBindings[0].HostPort
                     select ushort.Parse(hostPort)).ToArray();
        return _tcpPorts;
    }

    async Task<MultiplexedStream> BuildImageAndStartContainer()
    {
        await using Stream contents = CreateTarArchive();
        ImageBuildParameters imageBuildParameters = new() { Tags = new[] { _imageName } };
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
            Image = _imageName,
            AttachStdout = true,
            AttachStdin = _configuration.Stdin,
            OpenStdin = _configuration.Stdin,
            ExposedPorts = CreateExposedPorts(),
            HostConfig = CreatHostConfig()
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
        MultiplexedStream containerStream = await _dockerClient.Containers.AttachContainerAsync(_containerId, tty: false,
            containerAttachParameters, _cancellationTokenSource.Token);
        await _dockerClient.Containers.StartContainerAsync(_containerId, new ContainerStartParameters(), _cancellationTokenSource.Token);
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

    Dictionary<string, EmptyStruct>? CreateExposedPorts()
    {
        Dictionary<string, EmptyStruct>? exposedPorts = null;
        if (_configuration.TcpPorts is not null)
        {
            exposedPorts = new Dictionary<string, EmptyStruct>();
            foreach (ushort port in _configuration.TcpPorts)
                exposedPorts[$"{port}/tcp"] = new EmptyStruct();
        }
        return exposedPorts;
    }

    HostConfig? CreatHostConfig()
    {
        HostConfig? config = null;
        if (_configuration.TcpPorts is not null)
        {
            config ??= new HostConfig();
            var portBindings = new Dictionary<string, IList<PortBinding>>();
            foreach (ushort port in _configuration.TcpPorts)
                portBindings[$"{port}/tcp"] = new PortBinding[] { new() { HostPort = "0", HostIP = "0.0.0.0" } };
            config.PortBindings = portBindings;
        }
        if (_configuration.NetworkName is not null)
        {
            config ??= new HostConfig();
            config.NetworkMode = _configuration.NetworkName;
        }
        return config;
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
            ["reference"] = new Dictionary<string, bool> { [_imageName] = true }
        };
        ImagesListParameters imagesListParameters = new() { Filters = filters };
        IList<ImagesListResponse> images = await _dockerClient.Images.ListImagesAsync(imagesListParameters);
        if (images.Count > 0)
        {
            ImageDeleteParameters imageDeleteParameters = new() { Force = true };
            await _dockerClient.Images.DeleteImageAsync(_imageName, imageDeleteParameters);
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
