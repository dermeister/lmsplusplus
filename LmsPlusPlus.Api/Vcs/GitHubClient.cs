using Octokit;

namespace LmsPlusPlus.Api.Vcs;

class GitHubClient : IHostingClient
{
    static readonly ProductHeaderValue ProductHeaderValue = new("LMS++");
    readonly Octokit.GitHubClient _client = new(ProductHeaderValue);

    public Uri CreateAuthorizationUrl(string clientId)
    {
        OauthLoginRequest request = new(clientId) { Scopes = { "repo" } };
        return _client.Oauth.GetGitHubLoginUrl(request);
    }

    public async Task<string> CreateAuthorizationAccessToken(string code, string clientId, string clientSecret)
    {
        OauthTokenRequest request = new(clientId, clientSecret, code);
        OauthToken token = await _client.Oauth.CreateAccessToken(request);
        return token.AccessToken;
    }

    public async Task<Repository> CreateRepositoryFromTemplate(string repositoryName, string accessToken, Repository templateRepository)
    {
        Octokit.Repository gitHubRepository = await _client.Repository.Create(new NewRepository(repositoryName));
        Repository repository = new(gitHubRepository.CloneUrl, gitHubRepository.HtmlUrl, accessToken);
        await templateRepository.CopyTo(repository);
        return repository;
    }

    public async Task<string> GetUsername(string accessToken)
    {
        _client.Credentials = new Credentials(accessToken);
        User user;
        try
        {
            user = await _client.User.Current();
        }
        finally
        {
            _client.Credentials = null;
        }
        return user.Login;
    }
}
