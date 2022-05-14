using LibGit2Sharp;

namespace LmsPlusPlus.Api.Vcs;

class Repository
{
    readonly string? _accessToken;

    internal string? WebsiteUrl { get; }
    internal string CloneUrl { get; }

    internal Repository(string cloneUrl, string? websiteUrl, string? accessToken)
    {
        WebsiteUrl = websiteUrl;
        CloneUrl = cloneUrl;
        _accessToken = accessToken;
    }

    internal async Task CopyTo(Repository repository)
    {
        LibGit2Sharp.Repository? sourceRepositoryOnFileSystem = null;
        LibGit2Sharp.Repository? destinationRepositoryOnFileSystem = null;
        try
        {
            sourceRepositoryOnFileSystem = await Clone();
            destinationRepositoryOnFileSystem = await repository.Clone();
            await Task.Run(() => CopyRepositoryContent(sourceRepositoryOnFileSystem, destinationRepositoryOnFileSystem));
            Signature signature = new("LMS++", "lmsplusplus@gmail.com", DateTimeOffset.Now);
            destinationRepositoryOnFileSystem.Commit(message: "Initial commit", signature, signature);
            destinationRepositoryOnFileSystem.Network.Push(destinationRepositoryOnFileSystem.Head, new PushOptions
            {
                CredentialsProvider = (_, _, _) => new UsernamePasswordCredentials { Password = repository._accessToken }
            });
        }
        finally
        {
            string repositoryPath;
            if (sourceRepositoryOnFileSystem is not null)
            {
                repositoryPath = sourceRepositoryOnFileSystem.Info.WorkingDirectory;
                sourceRepositoryOnFileSystem.Dispose();
                DeleteRepositoryFiles(repositoryPath);
            }
            if (destinationRepositoryOnFileSystem is not null)
            {
                repositoryPath = destinationRepositoryOnFileSystem.Info.WorkingDirectory;
                destinationRepositoryOnFileSystem.Dispose();
                DeleteRepositoryFiles(repositoryPath);
            }
        }
    }

    async Task<LibGit2Sharp.Repository> Clone()
    {
        string temporaryDirectoryPath = Path.GetTempPath();
        string repositoryPath = Path.Combine(temporaryDirectoryPath, Guid.NewGuid().ToString());
        CloneOptions cloneOptions = new()
        {
            CredentialsProvider = (_, _, _) => new UsernamePasswordCredentials { Password = _accessToken },
        };
        await Task.Run(() => LibGit2Sharp.Repository.Clone(CloneUrl, repositoryPath, cloneOptions));
        return new LibGit2Sharp.Repository(repositoryPath);
    }

    static void CopyRepositoryContent(LibGit2Sharp.Repository sourceRepository, LibGit2Sharp.Repository destinationRepository)
    {
        EnumerationOptions enumerationOptions = new() { AttributesToSkip = 0 };
        IEnumerable<string> files = Directory.EnumerateFiles(sourceRepository.Info.WorkingDirectory, searchPattern: "*", enumerationOptions);
        IEnumerable<string> subdirectories = from subdirectory in Directory.EnumerateDirectories(sourceRepository.Info.WorkingDirectory)
                                             let subdirectoryInfo = new DirectoryInfo(subdirectory)
                                             where subdirectoryInfo.Name is not ".git"
                                             select subdirectory;
        enumerationOptions = new EnumerationOptions()
        {
            AttributesToSkip = 0,
            RecurseSubdirectories = true
        };
        foreach (string subdirectory in subdirectories)
            files = files.Concat(Directory.EnumerateFiles(subdirectory, searchPattern: "*", enumerationOptions));
        foreach (string file in files)
        {
            string fileRelativePath = Path.GetRelativePath(sourceRepository.Info.WorkingDirectory, file);
            string? directoryRelativePath = Path.GetDirectoryName(fileRelativePath);
            if (directoryRelativePath is not null and not "")
                Directory.CreateDirectory(Path.Combine(destinationRepository.Info.WorkingDirectory, directoryRelativePath));
            File.Copy(file, Path.Combine(destinationRepository.Info.WorkingDirectory, fileRelativePath));
            destinationRepository.Index.Add(fileRelativePath);
        }
        destinationRepository.Index.Write();
    }

    static void DeleteRepositoryFiles(string repositoryPath)
    {
        EnumerationOptions enumerationOptions = new()
        {
            AttributesToSkip = 0,
            RecurseSubdirectories = true
        };
        IEnumerable<string> files = Directory.EnumerateFiles(repositoryPath, "*", enumerationOptions);
        foreach (string file in files)
        {
            File.SetAttributes(file, FileAttributes.Normal);
            File.Delete(file);
        }
        Directory.Delete(repositoryPath, true);
    }
}
