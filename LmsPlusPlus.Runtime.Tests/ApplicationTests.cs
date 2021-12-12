using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
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
        string repositoryUrl = _applicationFixture.GetApplicationRepositoryUrl("EchoApplication");
        ApplicationConfiguration configuration = new(repositoryUrl, s_applicationWorkingDirectory);
        await using Application application = new(configuration);

        // Act
        ReadOnlyCollection<ServiceConfiguration> serviceConfigurations = await application.GetServiceConfigurations();

        // Assert
        Assert.Single(serviceConfigurations);
    }
}

public sealed class ApplicationFixture : IDisposable
{
    static readonly string s_applicationDirectory = Path.GetFullPath("Applications");
    readonly Dictionary<string, string> _applicationRepositories = new();

    public ApplicationFixture()
    {
        string applicationsDirectory = s_applicationDirectory;
        foreach (string directory in Directory.EnumerateDirectories(applicationsDirectory))
        {
            Repository repository = new(Repository.Init(directory));
            EnumerationOptions options = new() { RecurseSubdirectories = true };
            foreach (string file in Directory.EnumerateFiles(directory, searchPattern: "*", options))
            {
                string relativeFilePath = Path.GetRelativePath(directory, file);
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
