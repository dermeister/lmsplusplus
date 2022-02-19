namespace LmsPlusPlus.Api.Vcs;

interface IVcsHostingOauth
{
    Uri CreateAuthorizationUri();

    Task<string> CreateAccessToken(string code);
}
