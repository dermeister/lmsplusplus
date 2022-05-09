namespace LmsPlusPlus.Api.Vcs;

public class HostingClientFactory
{
    internal static IHostingClient CreateClient(string provider) => new GitHubClient();
}
