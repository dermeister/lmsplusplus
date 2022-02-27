namespace LmsPlusPlus.Api.Vcs;

public class HostingClientFactory
{
    readonly IConfiguration _configuration;

    public HostingClientFactory(IConfiguration configuration) => _configuration = configuration;

    internal IHostingClient CreateClient(string provider, string token) => new GitHubClient(token, _configuration["WorkingDirectory"]);
}
