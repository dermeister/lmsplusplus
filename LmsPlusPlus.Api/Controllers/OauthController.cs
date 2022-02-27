using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController, Route("oauth")]
public class OauthController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly VcsHostingOauthFactory _vcsHostingOauthFactory;
    readonly VcsHostingClientFactory _vcsHostingClientFactory;

    public OauthController(Infrastructure.ApplicationContext context, VcsHostingOauthFactory vcsHostingOauthFactory,
        VcsHostingClientFactory vcsHostingClientFactory)
    {
        _context = context;
        _vcsHostingOauthFactory = vcsHostingOauthFactory;
        _vcsHostingClientFactory = vcsHostingClientFactory;
    }

    [HttpGet("authorization-url/{provider}")]
    public string GetAuthorizationUrl(string provider)
    {
        IVcsHostingOauth oauth = _vcsHostingOauthFactory.CreateOAuth(provider);
        return oauth.CreateAuthorizationUri().ToString();
    }

    [HttpGet("callback/{provider}")]
    public async Task<IActionResult> Callback(string provider, string code)
    {
        IVcsHostingOauth oauth = _vcsHostingOauthFactory.CreateOAuth(provider);
        string token = await oauth.CreateAccessToken(code);
        IVcsHostingClient client = _vcsHostingClientFactory.CreateClient(provider, token);
        string username = await client.GetUsername();
        Infrastructure.VcsAccount account = new()
        {
            Name = username,
            AccessToken = token,
            HostingProviderId = provider
        };
        _context.Add(account);
        await _context.SaveChangesAsync();
        return Redirect("/authorization-redirect.html");
    }
}
