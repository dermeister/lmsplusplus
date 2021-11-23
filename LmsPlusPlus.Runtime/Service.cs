using System.Text;
using Docker.DotNet;
using Docker.DotNet.Models;
using ICSharpCode.SharpZipLib.Tar;

namespace LmsPlusPlus.Runtime;

public sealed class Service : IAsyncDisposable
{
    static int s_nextId;
    string? _containerId;
    int _isDisposed;
    readonly DockerClient _dockerClient = new DockerClientConfiguration().CreateClient();
    readonly ServiceConfiguration _configuration;
    readonly Task<MultiplexedStream> _buildImageAndStartContainerTask;
    readonly Progress<JSONMessage> _buildImageProgress;
    readonly ProgressReader<JSONMessage> _buildImageProgressReader;
    readonly SemaphoreSlim _containerStreamSemaphore = new(initialCount: 1);
    readonly CancellationTokenSource _cancellationTokenSource = new();

    public int Id { get; }

    internal Service(ServiceConfiguration configuration)
    {
        Id = GenerateId();
        _configuration = configuration;
        _buildImageProgress = new Progress<JSONMessage>();
        _buildImageProgressReader = new ProgressReader<JSONMessage>(_buildImageProgress);
        _buildImageAndStartContainerTask = BuildImageAndStartContainer();
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.Exchange(ref _isDisposed, value: 1) == 0)
        {
            _cancellationTokenSource.Cancel();
            try
            {
                await _buildImageAndStartContainerTask;
            }
            catch (OperationCanceledException)
            {
            }
            try
            {
                await RemoveContainer();
                await RemoveImage();
                _dockerClient.Dispose();
            }
            catch (DockerApiException)
            {
                throw new ServiceException("Unable to dispose service");
            }
        }
    }

    public async Task<ServiceOutput?> ReadAsync(CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        JSONMessage? message = await _buildImageProgressReader.ReadAsync();
        if (message is not null)
            return new ServiceOutput(ServiceOutputStage.Build, message.Stream);
        var linkedCancellationTokenSource = CancellationTokenSource.CreateLinkedTokenSource(_cancellationTokenSource.Token,
            cancellationToken);
        try
        {
            await _containerStreamSemaphore.WaitAsync(linkedCancellationTokenSource.Token);
            MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
            var buffer = new byte[1 << 16];
            MultiplexedStream.ReadResult readResult = await containerStream.ReadOutputAsync(buffer, offset: 0, buffer.Length,
                CancellationToken.None);
            if (readResult.EOF)
                return null;
            string content = Encoding.Default.GetString(buffer.AsSpan(start: 0, readResult.Count));
            return new ServiceOutput(ServiceOutputStage.Run, content);
        }
        catch (OperationCanceledException exception)
        {
            if (exception.CancellationToken == cancellationToken)
                throw;
            return null;
        }
        finally
        {
            _containerStreamSemaphore.Release();
            linkedCancellationTokenSource.Dispose();
        }
    }

    public async Task WriteAsync(string input, CancellationToken cancellationToken = default)
    {
        EnsureNotDisposed();
        var linkedCancellationTokenSource = CancellationTokenSource.CreateLinkedTokenSource(_cancellationTokenSource.Token,
            cancellationToken);
        try
        {
            await _containerStreamSemaphore.WaitAsync(linkedCancellationTokenSource.Token);
            MultiplexedStream containerStream = await _buildImageAndStartContainerTask;
            byte[] buffer = Encoding.Default.GetBytes(input);
            await containerStream.WriteAsync(buffer, offset: 0, buffer.Length, CancellationToken.None);
        }
        catch (OperationCanceledException exception)
        {
            if (exception.CancellationToken == cancellationToken)
                throw;
        }
        finally
        {
            _containerStreamSemaphore.Release();
            linkedCancellationTokenSource.Dispose();
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
        Stream? contents = null;
        try
        {
            contents = CreateTarArchive();
            ImageBuildParameters imageBuildParameters = new()
            {
                Tags = new[] { _configuration.Name }
            };
            await _dockerClient.Images.BuildImageFromDockerfileAsync(imageBuildParameters, contents, authConfigs: null, headers: null,
                _buildImageProgress);
        }
        finally
        {
            _buildImageProgressReader.Dispose();
            if (contents is not null)
                await contents.DisposeAsync();
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
        bool containerStarted = await _dockerClient.Containers.StartContainerAsync(createContainerResponse.ID,
            new ContainerStartParameters(), _cancellationTokenSource.Token);
        if (!containerStarted)
            throw new ServiceException("Unable to start container");
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
        if (_isDisposed == 1)
            throw new ObjectDisposedException(nameof(Service));
    }

    async Task RemoveContainer()
    {
        if (_containerId is not null)
        {
            ContainerRemoveParameters containerRemoveParameters = new()
            {
                Force = true
            };
            await _dockerClient.Containers.RemoveContainerAsync(_containerId, containerRemoveParameters);
        }
    }

    async Task RemoveImage()
    {
        Dictionary<string, IDictionary<string, bool>> filters = new()
        {
            ["reference"] = new Dictionary<string, bool>
            {
                [_configuration.Name] = true
            }
        };
        ImagesListParameters imagesListParameters = new()
        {
            Filters = filters
        };
        IList<ImagesListResponse> images = await _dockerClient.Images.ListImagesAsync(imagesListParameters);
        if (images.Count > 0)
        {
            ImageDeleteParameters imageDeleteParameters = new()
            {
                Force = true
            };
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
