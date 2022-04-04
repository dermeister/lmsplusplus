using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Threading.Tasks;
using LibGit2Sharp;
using Xunit;

namespace LmsPlusPlus.Runtime.Tests;

public class ApplicationTests : IClassFixture<ApplicationFixture>
{
    static readonly string s_applicationWorkingDirectory = Path.GetFullPath("WorkingDirectory");
    readonly ApplicationFixture _applicationFixture;

    public ApplicationTests(ApplicationFixture applicationFixture) => _applicationFixture = applicationFixture;

    [Fact]
    public async Task GetApplicationServiceConfigurations()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("EchoApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        ReadOnlyCollection<ServiceConfiguration> serviceConfigurations = await application.GetServiceConfigurations();

        // Assert
        Assert.Single(serviceConfigurations);
    }

    [Fact]
    public async Task ReadServiceBuildOutput()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("EchoApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        string serviceName = (await application.GetServiceConfigurations()).First().Name;
        ServiceBuildOutput? output = await application.ReadServiceBuildOutputAsync(serviceName);

        // Assert
        Assert.NotNull(output);
    }

    [Fact]
    public async Task ReadServiceOutput()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("EchoApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        string serviceName = (await application.GetServiceConfigurations()).First().Name;
        string? output = await TestUtils.ReadAllServiceOutput(application, serviceName);

        // Assert
        Assert.EndsWith(expectedEndString: "Hello from service!\r\n", output ?? "");
    }

    [Fact]
    public async Task WriteServiceInputAndReadOutput()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("CatApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        string serviceName = (await application.GetServiceConfigurations()).First().Name;
        await application.WriteServiceInputAsync(serviceName, input: "hello\n");
        string? output = await TestUtils.ReadAllServiceOutput(application, serviceName);

        // Assert
        Assert.EndsWith(expectedEndString: "hello\r\nhello\r\n", output ?? "");
    }

    [Fact]
    public async Task AccessApplicationServiceViaSocket()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("SocketApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        string serviceName = (await application.GetServiceConfigurations()).First().Name;
        ReadOnlyCollection<PortMapping> openedPorts = await application.GetOpenedPortsAsync(serviceName);
        PortMapping portMapping = openedPorts[0];
        await Task.Delay(1000);
        TcpClient client = TestUtils.ConnectToTcpSocket(portMapping.HostPort);
        TestUtils.WriteToTcpClient(client, message: "hello world");
        string output = TestUtils.ReadFromTcpClient(client);

        // Assert
        Assert.Equal(expected: "hello world", output);
    }

    [Fact]
    public async Task AccessMultiServiceApplication()
    {
        // Arrange
        ApplicationConfiguration applicationConfiguration = CreateApplicationConfiguration("MultiServiceApplication");
        await using Application application = new(applicationConfiguration);

        // Act
        await application.WriteServiceInputAsync(serviceName: "backend", input: "hello world\n");
        string? output = await TestUtils.ReadAllServiceOutput(application, serviceName: "frontend");

        // Assert
        Assert.EndsWith(expectedEndString: "hello world\r\n", output ?? "");
    }

    ApplicationConfiguration CreateApplicationConfiguration(string applicationName)
    {
        string repositoryUrl = _applicationFixture.GetApplicationRepositoryUrl(applicationName);
        return new ApplicationConfiguration(repositoryUrl, s_applicationWorkingDirectory);
    }
}

public sealed class ApplicationFixture : IDisposable
{
    static readonly string s_applicationsDirectory = Path.GetFullPath("Applications");
    readonly Dictionary<string, string> _applicationRepositories = new();

    public ApplicationFixture()
    {
        foreach (string directory in Directory.EnumerateDirectories(s_applicationsDirectory))
        {
            Repository repository = new(Repository.Init(directory));
            EnumerationOptions options = new()
            {
                RecurseSubdirectories = true,
                AttributesToSkip = 0
            };
            foreach (string file in Directory.EnumerateFiles(directory, searchPattern: "*", options))
            {
                string relativeFilePath = Path.GetRelativePath(directory, file);
                if (!relativeFilePath.StartsWith(".git")) // TODO: implement via DirectoryInfo
                    repository.Index.Add(relativeFilePath);
            }
            repository.Index.Write();
            Signature signature = CreateCommitSignature();
            repository.Commit(message: "Test commit", signature, signature);
            string applicationName = Path.GetFileName(directory); // Get directory's short name
            _applicationRepositories[applicationName] = directory;
        }
    }

    public void Dispose()
    {
        foreach (string repository in _applicationRepositories.Values)
        {
            EnumerationOptions options = new()
            {
                RecurseSubdirectories = true,
                AttributesToSkip = 0
            };
            string gitDirectoryPath = Path.Combine(repository, path2: ".git");
            foreach (string file in Directory.EnumerateFiles(gitDirectoryPath, searchPattern: "*", options))
            {
                File.SetAttributes(file, FileAttributes.Normal);
                File.Delete(file);
            }
            Directory.Delete(gitDirectoryPath, recursive: true);
        }
    }

    internal string GetApplicationRepositoryUrl(string applicationName) => _applicationRepositories[applicationName];

    static Signature CreateCommitSignature() => new(name: "unit-test", email: "unit-test@test.com", DateTimeOffset.Now);
}
