namespace LmsPlusPlus.Api.Vcs;

public class HostingOauthFactory
{
    readonly IConfiguration _configuration;

    public HostingOauthFactory(IConfiguration configuration) => _configuration = configuration;

    internal IHostingOauth CreateOAuth(string provider) => new GitHubOauth(_configuration);
}
