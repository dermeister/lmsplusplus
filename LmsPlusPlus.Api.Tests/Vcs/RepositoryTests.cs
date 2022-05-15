using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using LibGit2Sharp;
using Xunit;

namespace LmsPlusPlus.Api.Tests;

public class RepositoryTests : IClassFixture<RepositoryFixture>
{
    readonly RepositoryFixture _repositoryFixture;

    public RepositoryTests(RepositoryFixture repositoryFixture) => _repositoryFixture = repositoryFixture;

    [Fact]
    public async Task CopyTest()
    {
        // Arrange
        Vcs.Repository sourceRepository = new(_repositoryFixture.SourceRepositoryPath, websiteUrl: null, accessToken: null);
        Vcs.Repository destinationRepository = new(_repositoryFixture.DestinationRepositoryPath, websiteUrl: null, accessToken: null);

        // Act
        await sourceRepository.CopyTo(destinationRepository);

        // Assert
        Assert.Equal(expected: 1, _repositoryFixture.GetDestinationRepositoryCommitCount());
    }
}

public sealed class RepositoryFixture : IDisposable
{
    internal string SourceRepositoryPath { get; } = Path.Combine(Directory.GetCurrentDirectory(), Guid.NewGuid().ToString());
    internal string DestinationRepositoryPath { get; } = Path.Combine(Directory.GetCurrentDirectory(), Guid.NewGuid().ToString());

    Repository SourceRepository { get; }
    Repository DestinationRepository { get; }

    public RepositoryFixture()
    {
        SourceRepository = CreateSourceRepository();
        DestinationRepository = CreateDestinationRepository();
    }

    public void Dispose()
    {
        SourceRepository.Dispose();
        DestinationRepository.Dispose();
        EnumerationOptions enumerationOptions = new()
        {
            RecurseSubdirectories = true,
            AttributesToSkip = 0
        };
        IEnumerable<string> files = Directory.EnumerateFiles(SourceRepositoryPath, "*", enumerationOptions);
        files = files.Concat(Directory.EnumerateFiles(DestinationRepositoryPath, "*", enumerationOptions));
        foreach (string file in files)
        {
            File.SetAttributes(file, FileAttributes.Normal);
            File.Delete(file);
        }
        Directory.Delete(SourceRepositoryPath, true);
        Directory.Delete(DestinationRepositoryPath, true);
    }

    internal int GetDestinationRepositoryCommitCount() => DestinationRepository.Commits.Count();

    Repository CreateDestinationRepository()
    {
        Directory.CreateDirectory(DestinationRepositoryPath);
        return new Repository(Repository.Init(DestinationRepositoryPath, isBare: true));
    }

    Repository CreateSourceRepository()
    {
        Directory.CreateDirectory(SourceRepositoryPath);
        Repository repository = new(Repository.Init(SourceRepositoryPath));
        try
        {
            const string fileName = "test.txt";
            File.WriteAllText(Path.Combine(repository.Info.WorkingDirectory, fileName), "Test text");
            repository.Index.Add(fileName);
            repository.Index.Write();
            Signature signature = new("unit-test", "unit-test@test.com", DateTimeOffset.Now);
            repository.Commit("Test commit", signature, signature);
            return repository;
        }
        catch
        {
            repository.Dispose();
            throw;
        }
    }
}
