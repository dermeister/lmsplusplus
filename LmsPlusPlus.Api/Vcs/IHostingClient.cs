namespace LmsPlusPlus.Api.Vcs;

interface IHostingClient
{
    Uri CreateAuthorizationUrl(string clientId);

    Task<string> CreateAuthorizationAccessToken(string code, string clientId, string clientSecret);

    Task<string> GetUsername(string accessToken);

    Task<Repository> CreateRepositoryFromTemplate(string name, string accessToken, Repository templateRepository);
}
