namespace LmsPlusPlus.Api.Vcs;

public class VcsHostingClientFactory
{
    readonly IConfiguration _configuration;

    public VcsHostingClientFactory(IConfiguration configuration) => _configuration = configuration;

    internal IVcsHostingClient CreateClient(string provider, string token) => new GitHubClient(token, _configuration["WorkingDirectory"]);
}
