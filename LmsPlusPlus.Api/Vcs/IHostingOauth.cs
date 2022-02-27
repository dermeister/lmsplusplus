namespace LmsPlusPlus.Api.Vcs;

interface IHostingOauth
{
    Uri CreateAuthorizationUrl();

    Task<string> CreateAccessToken(string code);
}
