using Octokit;

namespace LmsPlusPlus.Api.Vcs;

class GitHubOauth : IHostingOauth
{
    readonly ProductHeaderValue _productHeaderValue = new("LMS++");
    readonly Octokit.GitHubClient _client;
    readonly string _clientId;
    readonly string _clientSecret;

    public GitHubOauth(IConfiguration configuration)
    {
        _clientId = configuration["GitHubOAuthClientId"];
        _clientSecret = configuration["GitHubOAuthClientSecret"];
        _client = new Octokit.GitHubClient(_productHeaderValue);
    }

    public Uri CreateAuthorizationUrl()
    {
        OauthLoginRequest request = new(_clientId) { Scopes = { "repo", "user:email" } };
        return _client.Oauth.GetGitHubLoginUrl(request);
    }

    public async Task<string> CreateAccessToken(string code)
    {
        OauthTokenRequest request = new(_clientId, _clientSecret, code);
        OauthToken token = await _client.Oauth.CreateAccessToken(request);
        return token.AccessToken;
    }
}
