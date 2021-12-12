namespace LmsPlusPlus.Runtime;

public class ApplicationConfiguration
{
    internal string RepositoryUrl { get; }
    internal string WorkingDirectory { get; }

    public ApplicationConfiguration(string repositoryUrl, string workingDirectory)
    {
        RepositoryUrl = repositoryUrl;
        WorkingDirectory = workingDirectory;
    }
}
