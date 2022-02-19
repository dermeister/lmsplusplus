namespace LmsPlusPlus.Api.Vcs;

public class VcsHostingOauthFactory
{
    readonly IConfiguration _configuration;

    public VcsHostingOauthFactory(IConfiguration configuration) => _configuration = configuration;

    internal IVcsHostingOauth CreateOAuth(string provider) => new GitHubOauth(_configuration);
}
