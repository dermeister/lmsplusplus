using System.Buffers;
using System.Collections.ObjectModel;
using System.Net;
using System.Text;
using System.Threading.Channels;
using Docker.DotNet;
using Docker.DotNet.Models;
using ICSharpCode.SharpZipLib.Tar;

namespace LmsPlusPlus.Runtime;

sealed class Service : IAsyncDisposable
{
    static readonly int s_fileModeInContainer = Convert.ToInt32(value: "755", fromBase: 8);
    static readonly ArrayPool<byte> s_buffers = ArrayPool<byte>.Create();
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task _buildImageAndCreateContainerTask;
    readonly Channel<JSONMessage> _buildImageProgressChannel = Channel.CreateUnbounded<JSONMessage>();
    readonly string _imageName;
    MultiplexedStream? _containerStream;
    bool _isEndOfStream;
    string? _containerId;
    bool _isDisposed;
    ReadOnlyCollection<PortMapping>? _portMappings;

    bool IsStarted => _containerStream is not null;

    internal Service(ServiceConfiguration configuration)
    {
        _configuration = configuration;
        _imageName = $"{_configuration.Name.ToLower()}-{Guid.NewGuid()}";
        _buildImageAndCreateContainerTask = BuildImageAndCreateContainer();
    }

    public async ValueTask DisposeAsync()
    {
        if (!_isDisposed)
        {
            _isDisposed = true;
            await _buildImageAndCreateContainerTask;
            await RemoveContainer();
            await RemoveImage();
            _dockerClient.Dispose();
        }
    }

    internal async Task<ServiceBuildOutput?> ReadBuildOutputAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        ServiceBuildOutput? output = null;
        bool isAuxMessage;
        do
        {
            isAuxMessage = false;
            bool canReadBuildImageProgress = await _buildImageProgressChannel.Reader.WaitToReadAsync(cancellationToken);
            if (canReadBuildImageProgress)
            {
                JSONMessage message = await _buildImageProgressChannel.Reader.ReadAsync(cancellationToken);
                // TODO: handle build errors
                if (message.Stream is not null)
                    output = new ServiceBuildOutput(message.Stream, Anchor: null);
                else if (message.Status is not null)
                {
                    string text;
                    if (message.ProgressMessage is not null && message.ID is not null)
                        text = $"{message.ID}: {message.Status} {message.ProgressMessage}\n";
                    else
                        text = $"{message.Status}\n";
                    output = new ServiceBuildOutput(text, message.ID);
                }
                else if (message.Aux is not null)
                    isAuxMessage = true;
                else
                    throw new Exception();
            }
            else
                output = null;
        }
        while (isAuxMessage);
        return output;
    }

    internal async Task Start(CancellationToken cancellationToken = default)
    {
        if (!IsStarted)
        {
            await _buildImageAndCreateContainerTask;
            ContainerAttachParameters containerAttachParameters = new()
            {
                Stream = true,
                Stdout = true,
                Stderr = true,
                Stdin = _configuration.Stdin
            };
            MultiplexedStream containerStream = await _dockerClient.Containers.AttachContainerAsync(_containerId, tty: false,
                containerAttachParameters, cancellationToken);
            await _dockerClient.Containers.StartContainerAsync(_containerId, new ContainerStartParameters(), cancellationToken);
            _containerStream = containerStream;
        }
    }

    internal async Task<string?> ReadOutputAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        EnsureStarted();
        if (_isEndOfStream)
            return null;
        byte[]? buffer = null;
        try
        {
            buffer = s_buffers.Rent(1 << 16);
            MultiplexedStream.ReadResult readResult = await _containerStream!.ReadOutputAsync(buffer, offset: 0, buffer.Length,
                cancellationToken);
            if (readResult.EOF)
            {
                _isEndOfStream = true;
                return null;
            }
            string content = Encoding.Default.GetString(buffer.AsSpan(start: 0, readResult.Count));
            return content;
        }
        finally
        {
            if (buffer is not null)
                s_buffers.Return(buffer);
        }
    }

    internal async Task WriteInputAsync(string input, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        EnsureStarted();
        if (!_isEndOfStream)
        {
            byte[] buffer = Encoding.Default.GetBytes(input);
            await _containerStream!.WriteAsync(buffer, offset: 0, buffer.Length, cancellationToken);
        }
    }

    internal async Task<ReadOnlyCollection<PortMapping>> GetOpenedPortsAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        EnsureStarted();
        if (_portMappings is not null)
            return _portMappings;
        if (_configuration.VirtualPortMappings is { Count: 0 })
            _portMappings = Array.AsReadOnly(Array.Empty<PortMapping>());
        else
        {
            ContainerInspectResponse containerInspectResponse = await _dockerClient.Containers.InspectContainerAsync(_containerId!,
                cancellationToken);
            IEnumerable<PortMapping> portMappings = from pair in containerInspectResponse.NetworkSettings.Ports
                                                    select CreatePortMapping(pair.Key, pair.Value[0]);
            _portMappings = Array.AsReadOnly(portMappings.ToArray());
        }
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

    async Task BuildImageAndCreateContainer()
    {
        ImageBuildParameters imageBuildParameters = new() { Tags = new[] { _imageName } };
        await using Stream contents = CreateTarArchiveFromContext();
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
            AttachStderr = true,
            AttachStdin = _configuration.Stdin,
            OpenStdin = _configuration.Stdin,
            ExposedPorts = CreateExposedPorts(),
            HostConfig = CreatHostConfig(),
            NetworkingConfig = CreateNetworkingConfig()
        };
        CreateContainerResponse createContainerResponse = await _dockerClient.Containers.CreateContainerAsync(createContainerParameters);
        _containerId = createContainerResponse.ID;
    }

    Stream CreateTarArchiveFromContext()
    {
        MemoryStream output = new();
        var archive = TarArchive.CreateOutputTarArchive(output);
        archive.IsStreamOwner = false;
        string contextPath = _configuration.ContextPath;
        string currentDirectory = Directory.GetCurrentDirectory();
        if (contextPath.StartsWith(currentDirectory))
            contextPath = Path.GetRelativePath(currentDirectory, contextPath);
        archive.RootPath = contextPath.TrimStart('/'); // SharpZipLib trims entry paths if they are absolute
        IEnumerable<string> files = Directory.EnumerateFiles(contextPath);
        IEnumerable<string> subdirectories = Directory.EnumerateDirectories(contextPath);
        foreach (string path in files.Concat(subdirectories))
        {
            var entry = TarEntry.CreateEntryFromFile(path);
            entry.TarHeader.Mode = s_fileModeInContainer;
            archive.WriteEntry(entry, recurse: true);
        }
        archive.Close();
        output.Position = 0;
        return output;
    }

    Dictionary<string, EmptyStruct> CreateExposedPorts()
    {
        Dictionary<string, EmptyStruct> exposedPorts = new();
        foreach (VirtualPortMapping portMapping in _configuration.VirtualPortMappings)
        {
            string containerPortInDockerFormat = ConvertContainerPortToDockerFormat(portMapping.ContainerPort, portMapping.PortType);
            exposedPorts[containerPortInDockerFormat] = new EmptyStruct();
        }
        return exposedPorts;
    }

    HostConfig CreatHostConfig()
    {
        HostConfig? config = null;
        config ??= new HostConfig();
        var portBindings = new Dictionary<string, IList<PortBinding>>();
        foreach (VirtualPortMapping portMapping in _configuration.VirtualPortMappings)
        {
            string containerPortInDockerFormat = ConvertContainerPortToDockerFormat(portMapping.ContainerPort, portMapping.PortType);
            portBindings[containerPortInDockerFormat] = new PortBinding[] { new() { HostPort = "0", HostIP = "0.0.0.0" } };
        }
        config.PortBindings = portBindings;
        config.NetworkMode = _configuration.NetworkName;
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

    NetworkingConfig CreateNetworkingConfig()
    {
        NetworkingConfig config = new();
        if (_configuration.NetworkName is not null)
            config.EndpointsConfig = new Dictionary<string, EndpointSettings>
            {
                [_configuration.NetworkName] = new() { Aliases = new[] { _configuration.Name } }
            };
        return config;
    }

    void EnsureNotDisposed()
    {
        if (_isDisposed)
            throw new ObjectDisposedException(nameof(Service));
    }

    void EnsureStarted()
    {
        if (!IsStarted)
            throw new InvalidOperationException("Container is not started");
    }

    async ValueTask RemoveContainer()
    {
        if (_containerId is not null)
        {
            ContainerRemoveParameters containerRemoveParameters = new() { Force = true };
            try
            {
                await _dockerClient.Containers.RemoveContainerAsync(_containerId, containerRemoveParameters);
            }
            catch (DockerApiException e) when (e.StatusCode == HttpStatusCode.InternalServerError)
            {
                // retry if daemon fails to kill container
                await _dockerClient.Containers.RemoveContainerAsync(_containerId, containerRemoveParameters);
            }
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

public record ServiceBuildOutput(string Text, string? Anchor);

public record PortMapping
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
