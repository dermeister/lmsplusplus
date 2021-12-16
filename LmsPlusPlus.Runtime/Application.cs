using System.Collections.ObjectModel;
using Docker.DotNet;
using Docker.DotNet.Models;
using LibGit2Sharp;
using LmsPlusPlus.Runtime.DockerCompose;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace LmsPlusPlus.Runtime;

public sealed class Application : IAsyncDisposable
{
    static readonly IDeserializer s_yamlDeserializer;
    readonly ApplicationConfiguration _configuration;
    readonly string _repositoryDirectory;
    readonly Task<Dictionary<string, ServiceConfiguration>> _createServiceConfigurations;
    readonly Task<Dictionary<ServiceConfiguration, Service>> _createServicesTask;
    readonly Task _startServicesTask;
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly string _networkName = $"network-{Guid.NewGuid()}";
    string? _networkId;
    bool _isDisposed;

    static Application()
    {
        s_yamlDeserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .IgnoreUnmatchedProperties()
            .Build();
    }

    public Application(ApplicationConfiguration configuration)
    {
        _configuration = configuration;
        _repositoryDirectory = Path.Combine(_configuration.WorkingDirectory, Guid.NewGuid().ToString());
        _createServiceConfigurations = CloneRepositoryAndCreateServiceConfigurations();
        _createServicesTask = CreateServices();
        _startServicesTask = StartServices();
    }

    public async ValueTask DisposeAsync()
    {
        if (!_isDisposed)
        {
            _isDisposed = true;
            Dictionary<ServiceConfiguration, Service> services = await _createServicesTask;
            IEnumerable<ValueTask> disposeServiceTasks = services.Values.Select(s => s.DisposeAsync());
            foreach (ValueTask disposeServiceTask in disposeServiceTasks)
                await disposeServiceTask;
            await RemoveServiceNetwork();
            _dockerClient.Dispose();
            DeleteRepositoryDirectory(_repositoryDirectory);
        }
    }

    public async Task<ReadOnlyCollection<ServiceConfiguration>> GetServiceConfigurations()
    {
        EnsureNotDisposed();
        Dictionary<string, ServiceConfiguration> configurations = await _createServiceConfigurations;
        return new ReadOnlyCollection<ServiceConfiguration>(configurations.Values.ToArray());
    }

    public async Task<string?> ReadServiceBuildOutputAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        Service service = await GetServiceByName(serviceName);
        return await service.ReadBuildOutputAsync(cancellationToken);
    }

    public async Task<string?> ReadServiceOutputAsync(string serviceName, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        await _startServicesTask;
        Service service = await GetServiceByName(serviceName);
        return await service.ReadOutputAsync(cancellationToken);
    }

    public async Task WriteServiceInputAsync(string serviceName, string input, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        await _startServicesTask;
        Service service = await GetServiceByName(serviceName);
        await service.WriteInputAsync(input, cancellationToken);
    }

    public async Task<ReadOnlyCollection<PortMapping>> GetOpenedPortsAsync(string serviceName,
        CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        await _startServicesTask;
        Service service = await GetServiceByName(serviceName);
        return await service.GetOpenedPortsAsync(cancellationToken);
    }

    static void DeleteRepositoryDirectory(string path)
    {
        EnumerationOptions enumerationOptions = new()
        {
            RecurseSubdirectories = true,
            AttributesToSkip = 0
        };
        IEnumerable<string> files = Directory.EnumerateFiles(path, searchPattern: "*", enumerationOptions);
        foreach (string file in files)
        {
            File.SetAttributes(file, FileAttributes.Normal);
            File.Delete(file);
        }
        Directory.Delete(path, recursive: true);
    }

    static void ValidateCompose(Compose compose)
    {
        if (compose.Services.Values.Any(service => service.Build is null))
            throw new Exception("Invalid docker-compose file");
        // TODO: Validate ports
    }

    static ReadOnlyCollection<VirtualPortMapping> CreateVirtualPortMappings(IEnumerable<string>? portMappingsInDockerComposeFormat)
    {
        if (portMappingsInDockerComposeFormat is null)
            return new ReadOnlyCollection<VirtualPortMapping>(Array.Empty<VirtualPortMapping>());
        IEnumerable<VirtualPortMapping> portMappings = from portMappingInDockerComposeFormat in portMappingsInDockerComposeFormat
                                                       let parts = portMappingInDockerComposeFormat.Split(':')
                                                       let hostPort = ushort.Parse(parts[0])
                                                       let containerPort = ushort.Parse(parts[1])
                                                       select new VirtualPortMapping(PortType.Tcp, containerPort, hostPort);
        return new ReadOnlyCollection<VirtualPortMapping>(portMappings.ToArray());
    }

    async Task<Dictionary<string, ServiceConfiguration>> CloneRepositoryAndCreateServiceConfigurations()
    {
        Directory.CreateDirectory(_repositoryDirectory);
        await Task.Run(() => Repository.Clone(_configuration.RepositoryUrl, _repositoryDirectory));
        string configurationDirectoryPath = Path.Combine(_repositoryDirectory, path2: ".lmsplusplus");
        string dockerComposeFilePath = Path.Combine(configurationDirectoryPath, path2: "docker-compose.yml");
        string dockerComposeFileContent = await File.ReadAllTextAsync(dockerComposeFilePath);
        Compose compose = s_yamlDeserializer.Deserialize<Compose>(dockerComposeFileContent);
        ValidateCompose(compose);
        await CreateServiceNetwork();
        return (from pair in compose.Services
                let name = pair.Key
                let contextPath = Path.GetFullPath(Path.Combine(configurationDirectoryPath, pair.Value.Build))
                let stdin = pair.Value.StdinOpen
                let virtualPortMappings = CreateVirtualPortMappings(pair.Value.Ports)
                let serviceConfiguration = new ServiceConfiguration(name, contextPath)
                {
                    Stdin = stdin,
                    VirtualPortMappings = virtualPortMappings,
                    NetworkName = _networkName
                }
                select serviceConfiguration).ToDictionary(x => x.Name, x => x);
    }

    async ValueTask CreateServiceNetwork()
    {
        NetworksCreateParameters networksCreateParameters = new() { Name = _networkName };
        NetworksCreateResponse response = await _dockerClient.Networks.CreateNetworkAsync(networksCreateParameters);
        _networkId = response.ID;
    }

    async ValueTask RemoveServiceNetwork()
    {
        if (_networkId is not null)
            await _dockerClient.Networks.DeleteNetworkAsync(_networkId);
    }

    async Task<Dictionary<ServiceConfiguration, Service>> CreateServices()
    {
        IEnumerable<KeyValuePair<ServiceConfiguration, Service>> pairs = from configuration in (await _createServiceConfigurations).Values
                                                                         let service = new Service(configuration)
                                                                         select KeyValuePair.Create(configuration, service);
        return new Dictionary<ServiceConfiguration, Service>(pairs);
    }

    async Task StartServices()
    {
        IEnumerable<Task> startServicesTasks = (await _createServicesTask).Values.Select(s => s.Start());
        await Task.WhenAll(startServicesTasks);
    }

    void EnsureNotDisposed()
    {
        if (_isDisposed)
            throw new ObjectDisposedException(nameof(Application));
    }

    async Task<Service> GetServiceByName(string name)
    {
        Dictionary<string, ServiceConfiguration> configurations = await _createServiceConfigurations;
        ServiceConfiguration configuration = configurations[name];
        Dictionary<ServiceConfiguration, Service> services = await _createServicesTask;
        return services[configuration];
    }
}
