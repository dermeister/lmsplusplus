using System.Buffers;
using System.Collections.ObjectModel;
using System.Net;
using System.Text;
using System.Threading.Channels;
using Docker.DotNet;
using Docker.DotNet.Models;
using ICSharpCode.SharpZipLib.Tar;

namespace LmsPlusPlus.Runtime;

public sealed class Service : IAsyncDisposable
{
    static readonly int s_dockerizedFileMode = Convert.ToInt32(value: "755", fromBase: 8);
    static readonly ArrayPool<byte> s_buffers = ArrayPool<byte>.Create();
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task<MultiplexedStream> _buildImageAndStartContainerTask;
    readonly CancellationTokenSource _cancellationTokenSource = new();
    readonly Channel<JSONMessage> _buildImageProgressChannel = Channel.CreateUnbounded<JSONMessage>();
    readonly string _imageName;
    string? _containerId;
    bool _isDisposed;
    ReadOnlyCollection<PortMapping>? _portMappings;

    public string Name => _configuration.Name;

    internal Service(ServiceConfiguration configuration)
    {
        _configuration = configuration;
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
        bool canReadBuildImageProgress = await _buildImageProgressChannel.Reader.WaitToReadAsync(cancellationToken);
        if (canReadBuildImageProgress)
        {
            JSONMessage message = await _buildImageProgressChannel.Reader.ReadAsync(cancellationToken);
            return new ServiceOutput(ServiceOutputStage.Build, message.Stream);
        }
        MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
        byte[]? buffer = null;
        try
        {
            buffer = s_buffers.Rent(1 << 16);
            MultiplexedStream.ReadResult readResult = await containerStream.ReadOutputAsync(buffer, offset: 0, buffer.Length,
                cancellationToken);
            if (readResult.EOF)
                return null;
            string content = Encoding.Default.GetString(buffer.AsSpan(start: 0, readResult.Count));
            return new ServiceOutput(ServiceOutputStage.Run, content);
        }
        finally
        {
            if (buffer is not null)
                s_buffers.Return(buffer);
        }
    }

    public async Task WriteAsync(string input, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
        byte[] buffer = Encoding.Default.GetBytes(input);
        await containerStream.WriteAsync(buffer, offset: 0, buffer.Length, cancellationToken);
    }

    public async Task<ReadOnlyCollection<PortMapping>?> GetOpenedPortsAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        if (_configuration.VirtualPortMappings is null)
            return null;
        if (_portMappings is not null)
            return _portMappings;
        await _buildImageAndStartContainerTask;
        ContainerInspectResponse containerInspectResponse = await _dockerClient.Containers.InspectContainerAsync(_containerId!,
            cancellationToken);
        IEnumerable<PortMapping> portMappings = from pair in containerInspectResponse.NetworkSettings.Ports
                                                select CreatePortMapping(pair.Key, pair.Value[0]);
        _portMappings = Array.AsReadOnly(portMappings.ToArray());
        return _portMappings;
    }

    static string ConvertContainerPortToDockerFormat(ushort containerPort, PortType portType)
    {
        var containerPortInDockerFormat = containerPort.ToString();
        string portTypeInDockerFormat = portType switch
        {
            PortType.Tcp => "tcp",
            PortType.Udp => "udp",
            _ => throw new ArgumentOutOfRangeException(nameof(portType), portType, message: null)
        };
        return $"{containerPortInDockerFormat}/{portTypeInDockerFormat}";
    }

    static (ushort ContainerPort, PortType PortType) ConvertContainerPortFromDockerFormat(string containerPortInDockerFormat)
    {
        string[] containerPortAndPortType = containerPortInDockerFormat.Split('/');
        var containerPort = ushort.Parse(containerPortAndPortType[0]);
        PortType portType = containerPortAndPortType[1] switch
        {
            "tcp" => PortType.Tcp,
            "udp" => PortType.Udp,
            _ => throw new ArgumentException($"Not a docker format: {containerPortInDockerFormat}", nameof(containerPortInDockerFormat))
        };
        return (containerPort, portType);
    }

    async Task<MultiplexedStream> BuildImageAndStartContainer()
    {
        ImageBuildParameters imageBuildParameters = new() { Tags = new[] { _imageName } };
        await using Stream contents = CreateTarArchive();
        Progress<JSONMessage> progress = new(value => _buildImageProgressChannel.Writer.TryWrite(value));
        try
        {
            await _dockerClient.Images.BuildImageFromDockerfileAsync(imageBuildParameters, contents, authConfigs: null, headers: null,
                progress);
        }
        finally
        {
            _buildImageProgressChannel.Writer.Complete();
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
            entry.TarHeader.Mode = s_dockerizedFileMode;
            archive.WriteEntry(entry, recurse: false);
        }
        archive.Close();
        output.Position = 0;
        return output;
    }

    Dictionary<string, EmptyStruct>? CreateExposedPorts()
    {
        Dictionary<string, EmptyStruct>? exposedPorts = null;
        if (_configuration.VirtualPortMappings is not null)
        {
            exposedPorts = new Dictionary<string, EmptyStruct>();
            foreach (VirtualPortMapping portMapping in _configuration.VirtualPortMappings)
            {
                string containerPortInDockerFormat = ConvertContainerPortToDockerFormat(portMapping.ContainerPort, portMapping.PortType);
                exposedPorts[containerPortInDockerFormat] = new EmptyStruct();
            }
        }
        return exposedPorts;
    }

    HostConfig? CreatHostConfig()
    {
        HostConfig? config = null;
        if (_configuration.VirtualPortMappings is not null)
        {
            config ??= new HostConfig();
            var portBindings = new Dictionary<string, IList<PortBinding>>();
            foreach (VirtualPortMapping portMapping in _configuration.VirtualPortMappings)
            {
                string containerPortInDockerFormat = ConvertContainerPortToDockerFormat(portMapping.ContainerPort, portMapping.PortType);
                portBindings[containerPortInDockerFormat] = new PortBinding[] { new() { HostPort = "0", HostIP = "0.0.0.0" } };
            }
            config.PortBindings = portBindings;
        }
        if (_configuration.NetworkName is not null)
        {
            config ??= new HostConfig();
            config.NetworkMode = _configuration.NetworkName;
        }
        return config;
    }

    PortMapping CreatePortMapping(string containerPortInDockerFormat, PortBinding portBinding)
    {
        if (_configuration.VirtualPortMappings is null)
            throw new InvalidOperationException("Virtual port mappings has not been initialized");
        (ushort containerPort, PortType portType) = ConvertContainerPortFromDockerFormat(containerPortInDockerFormat);
        bool Match(VirtualPortMapping virtualPortMapping) => virtualPortMapping.ContainerPort == containerPort;
        ushort correspondingVirtualHostPort = _configuration.VirtualPortMappings.First(Match).VirtualHostPort;
        var hostPort = ushort.Parse(portBinding.HostPort);
        var hostIpAddress = IPAddress.Parse(portBinding.HostIP);
        return new PortMapping(portType, containerPort, correspondingVirtualHostPort, hostPort, hostIpAddress);
    }

    void EnsureNotDisposed()
    {
        if (_isDisposed)
            throw new ObjectDisposedException(nameof(Service));
    }

    async ValueTask RemoveContainer()
    {
        if (_containerId is not null)
        {
            ContainerRemoveParameters containerRemoveParameters = new() { Force = true };
            await _dockerClient.Containers.RemoveContainerAsync(_containerId, containerRemoveParameters);
        }
    }

    async ValueTask RemoveImage()
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

class ServiceConfiguration
{
    internal string Name { get; }
    internal string ContextPath { get; }
    internal ReadOnlyCollection<VirtualPortMapping>? VirtualPortMappings { get; init; }
    internal bool Stdin { get; init; }
    internal string? NetworkName { get; init; }

    internal ServiceConfiguration(string name, string contextPath)
    {
        Name = name;
        ContextPath = contextPath;
    }
}

readonly struct VirtualPortMapping
{
    internal PortType PortType { get; }
    internal ushort ContainerPort { get; }
    internal ushort VirtualHostPort { get; }

    internal VirtualPortMapping(PortType portType, ushort containerPort, ushort virtualHostPort)
    {
        PortType = portType;
        ContainerPort = containerPort;
        VirtualHostPort = virtualHostPort;
    }
}

public readonly struct PortMapping
{
    public PortType PortType { get; }
    public ushort ContainerPort { get; }
    public ushort VirtualHostPort { get; }
    public ushort HostPort { get; }
    public IPAddress HostIpAddress { get; }

    internal PortMapping(PortType portType, ushort containerPort, ushort virtualHostPort, ushort hostPort, IPAddress hostIpAddress)
    {
        ContainerPort = containerPort;
        VirtualHostPort = virtualHostPort;
        HostPort = hostPort;
        HostIpAddress = hostIpAddress;
        PortType = portType;
    }
}

public enum PortType
{
    Tcp,
    Udp
}

public class ServiceOutput
{
    public ServiceOutputStage Stage { get; }
    public string Content { get; }

    internal ServiceOutput(ServiceOutputStage stage, string content)
    {
        Stage = stage;
        Content = content;
    }
}

public enum ServiceOutputStage
{
    Build,
    Run
}
