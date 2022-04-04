namespace LmsPlusPlus.Runtime;

public record ApplicationConfiguration(string RepositoryUrl, string WorkingDirectory)
{
    internal string RepositoryUrl { get; } = RepositoryUrl;
    internal string WorkingDirectory { get; } = WorkingDirectory;
}
