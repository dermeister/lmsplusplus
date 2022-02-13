using LibGit2Sharp;
using LibGit2Sharp.Handlers;

namespace LmsPlusPlus.Api.Vsc;

static class RepositoryUtils
{
    internal static async Task CopyRepository(string workingDirectory, Uri sourceRepositoryUri, Uri destinationRepositoryUri,
        string username, string token, string name, string email)
    {
        string sourceRepositoryDirectory = Path.Combine(workingDirectory, Guid.NewGuid().ToString());
        string destinationRepositoryDirectory = Path.Combine(workingDirectory, Guid.NewGuid().ToString());
        Task cloneSourceRepositoryTask = CloneRepository(sourceRepositoryUri.ToString(), sourceRepositoryDirectory, username: "",
            token: "");
        Task cloneDestinationRepositoryTask = CloneRepository(destinationRepositoryUri.ToString(), destinationRepositoryDirectory, username,
            token);
        await Task.WhenAll(cloneSourceRepositoryTask, cloneDestinationRepositoryTask);
        Repository destinationRepository = new(destinationRepositoryDirectory);
        CopyRepositoryContent(sourceRepositoryDirectory, destinationRepositoryDirectory, destinationRepository);
        Signature signature = new(name, email, DateTimeOffset.Now);
        destinationRepository.Commit(message: "Initial commit", signature, signature);
        destinationRepository.Network.Push(destinationRepository.Head, new PushOptions
        {
            CredentialsProvider = CreateCredentialsProvider(username, token)
        });
        // TODO: clean up
    }

    static CredentialsHandler CreateCredentialsProvider(string username, string token)
    {
        return (_, _, _) => new UsernamePasswordCredentials
        {
            Username = username,
            Password = token
        };
    }

    static Task CloneRepository(string url, string directory, string username, string token)
    {
        return Task.Run(() => Repository.Clone(url, directory, new CloneOptions
        {
            CredentialsProvider = CreateCredentialsProvider(username, token)
        }));
    }

    static void CopyRepositoryContent(string sourcePath, string destinationPath, IRepository repository)
    {
        DirectoryInfo sourceDirectory = new(sourcePath);
        EnumerationOptions enumerationOptions = new() { AttributesToSkip = 0 };
        IEnumerable<DirectoryInfo> directories = sourceDirectory.EnumerateDirectories(searchPattern: "*", enumerationOptions)
            .Where(d => d.Name is not ".git");
        foreach (DirectoryInfo directory in directories)
            CopyDirectory(directory.FullName, sourcePath, destinationPath, repository);
        CopyFiles(sourceDirectory.FullName, sourcePath, destinationPath, repository);
        repository.Index.Write();
    }

    static void CopyDirectory(string directory, string sourcePath, string destinationPath, IRepository repository)
    {
        string directoryRelativePath = Path.GetRelativePath(sourcePath, directory);
        Directory.CreateDirectory(Path.Combine(destinationPath, directoryRelativePath));
        CopyFiles(directory, sourcePath, destinationPath, repository);
        EnumerationOptions enumerationOptions = new()
        {
            AttributesToSkip = 0,
            RecurseSubdirectories = true
        };
        IEnumerable<string> subdirectories = Directory.EnumerateDirectories(directory, searchPattern: "*", enumerationOptions);
        foreach (string subdirectory in subdirectories)
        {
            string subdirectoryRelativePath = Path.GetRelativePath(sourcePath, subdirectory);
            Directory.CreateDirectory(Path.Combine(destinationPath, subdirectoryRelativePath));
            CopyFiles(subdirectory, sourcePath, destinationPath, repository);
        }
    }

    static void CopyFiles(string directory, string sourcePath, string destinationPath, IRepository repository)
    {
        EnumerationOptions enumerationOptions = new() { AttributesToSkip = 0 };
        IEnumerable<string> files = Directory.EnumerateFiles(directory, searchPattern: "*", enumerationOptions);
        foreach (string file in files)
        {
            string fileRelativePath = Path.GetRelativePath(sourcePath, file);
            File.Copy(file, Path.Combine(destinationPath, fileRelativePath));
            repository.Index.Add(fileRelativePath);
        }
    }
}
