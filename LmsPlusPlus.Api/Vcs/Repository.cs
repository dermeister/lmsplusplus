using LibGit2Sharp;

namespace LmsPlusPlus.Api.Vcs;

class Repository
{
    readonly string _accessToken;

    internal string? WebsiteUrl { get; }
    internal string CloneUrl { get; }

    internal Repository(string cloneUrl, string? websiteUrl, string accessToken)
    {
        WebsiteUrl = websiteUrl;
        CloneUrl = cloneUrl;
        _accessToken = accessToken;
    }

    internal async Task CopyTo(Repository repository)
    {
        LibGit2Sharp.Repository? physicalSourceRepository = null;
        LibGit2Sharp.Repository? physicalTargetRepository = null;
        try
        {
            physicalSourceRepository = await Clone();
            physicalTargetRepository = await repository.Clone();
            await Task.Run(() => CopyRepositoryContent(physicalSourceRepository, physicalTargetRepository));
            Signature signature = new("LMS++", "lmsplusplus@gmail.com", DateTimeOffset.Now);
            physicalTargetRepository.Commit(message: "Initial commit", signature, signature);
            physicalTargetRepository.Network.Push(physicalTargetRepository.Head, new PushOptions
            {
                CredentialsProvider = (_, _, _) => new UsernamePasswordCredentials { Password = repository._accessToken }
            });
        }
        finally
        {
            if (physicalSourceRepository is not null)
            {
                DeleteRepositoryFromFileSystem(physicalSourceRepository);
                physicalSourceRepository.Dispose();
            }
            if (physicalTargetRepository is not null)
            {
                DeleteRepositoryFromFileSystem(physicalTargetRepository);
                physicalTargetRepository.Dispose();
            }
        }
    }

    async Task<LibGit2Sharp.Repository> Clone()
    {
        string temporaryDirectoryPath = Path.GetTempPath();
        string repositoryPath = Path.Combine(temporaryDirectoryPath, Guid.NewGuid().ToString());
        CloneOptions cloneOptions = new()
        {
            CredentialsProvider = (_, _, _) => new UsernamePasswordCredentials { Password = _accessToken }
        };
        await Task.Run(() => LibGit2Sharp.Repository.Clone(CloneUrl, repositoryPath, cloneOptions));
        return new LibGit2Sharp.Repository(repositoryPath);
    }

    static void CopyRepositoryContent(LibGit2Sharp.Repository sourceRepository, LibGit2Sharp.Repository targetRepository)
    {
        EnumerationOptions enumerationOptions = new() { AttributesToSkip = 0 };
        IEnumerable<string> files = Directory.EnumerateFiles(sourceRepository.Info.WorkingDirectory, searchPattern: "*", enumerationOptions);
        IEnumerable<string> subdirectories = from subdirectory in Directory.EnumerateDirectories(sourceRepository.Info.WorkingDirectory)
                                             let subdirectoryInfo = new DirectoryInfo(subdirectory)
                                             where subdirectoryInfo.Name is not ".git"
                                             select subdirectory;
        enumerationOptions = new() { AttributesToSkip = 0, RecurseSubdirectories = true };
        foreach (string subdirectory in subdirectories)
            files = files.Concat(Directory.EnumerateFiles(subdirectory, searchPattern: "*", enumerationOptions));
        foreach (string file in files)
        {
            string fileRelativePath = Path.GetRelativePath(sourceRepository.Info.WorkingDirectory, file);
            string? directoryRelativePath = Path.GetDirectoryName(fileRelativePath);
            if (directoryRelativePath is not null and not "")
                Directory.CreateDirectory(Path.Combine(targetRepository.Info.WorkingDirectory, directoryRelativePath));
            File.Copy(file, Path.Combine(targetRepository.Info.WorkingDirectory, fileRelativePath));
            targetRepository.Index.Add(fileRelativePath);
        }
        targetRepository.Index.Write();
    }

    static void DeleteRepositoryFromFileSystem(LibGit2Sharp.Repository repository)
    {
        EnumerationOptions enumerationOptions = new() { AttributesToSkip = 0, RecurseSubdirectories = true };
        IEnumerable<string> files = Directory.EnumerateFiles(repository.Info.WorkingDirectory, "*", enumerationOptions);
        foreach (string file in files)
        {
            File.SetAttributes(file, FileAttributes.Normal);
            File.Delete(file);
        }
        Directory.Delete(repository.Info.WorkingDirectory, true);
    }
}
