namespace LmsPlusPlus.Api.Vcs;

interface IHostingClient
{
    string CreateAuthorizationUrl(string clientId, long userId);

    Task<string> CreateAuthorizationAccessToken(string code, string clientId, string clientSecret);

    Task<string> GetUsername(string accessToken);

    Task<Repository> CreateRepositoryFromTemplate(string name, string accessToken, Repository templateRepository);
}
