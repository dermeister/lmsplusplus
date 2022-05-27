using Octokit;

namespace LmsPlusPlus.Api.Vcs;

class GitHubClient : IHostingClient
{
    static readonly ProductHeaderValue ProductHeaderValue = new("LMS++");
    readonly Octokit.GitHubClient _client = new(ProductHeaderValue);

    public string CreateAuthorizationUrl(string clientId, long userId)
    {
        OauthLoginRequest request = new(clientId) { Scopes = { "repo" }, State = userId.ToString() };
        Uri url = _client.Oauth.GetGitHubLoginUrl(request);
        return url.ToString();
    }

    public async Task<string> CreateAuthorizationAccessToken(string code, string clientId, string clientSecret)
    {
        OauthTokenRequest request = new(clientId, clientSecret, code);
        OauthToken token = await _client.Oauth.CreateAccessToken(request);
        return token.AccessToken;
    }

    public async Task<Repository> CreateRepositoryFromTemplate(string repositoryName, string accessToken, Repository templateRepository)
    {
        Octokit.Repository gitHubRepository;
        Credentials emptyCredentials = _client.Credentials;
        string username;
        try
        {
            _client.Credentials = new Credentials(accessToken);
            gitHubRepository = await _client.Repository.Create(new NewRepository(repositoryName));
            username = (await _client.User.Current()).Login;
        }
        catch (ApiException e)
        {
            throw new RepositoryCreationException(e);
        }
        finally
        {
            _client.Credentials = emptyCredentials;
        }
        Repository repository = new(gitHubRepository.CloneUrl, gitHubRepository.HtmlUrl, username, accessToken);
        try
        {
            await templateRepository.CopyTo(repository);
        }
        catch
        {
            // await _client.Repository.Delete(gitHubRepository.Owner.Login, gitHubRepository.Name);
            throw;
        }
        return repository;
    }

    public async Task<string> GetUsername(string accessToken)
    {
        Credentials emptyCredentials = _client.Credentials;
        _client.Credentials = new Credentials(accessToken);
        User user;
        try
        {
            user = await _client.User.Current();
        }
        finally
        {
            _client.Credentials = emptyCredentials;
        }
        return user.Login;
    }
}
