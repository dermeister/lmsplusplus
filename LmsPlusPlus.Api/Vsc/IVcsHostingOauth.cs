namespace LmsPlusPlus.Api.Vsc;

interface IVcsHostingOauth
{
    Uri CreateAuthorizationUri();

    Task<string> CreateAccessToken(string code);
}
