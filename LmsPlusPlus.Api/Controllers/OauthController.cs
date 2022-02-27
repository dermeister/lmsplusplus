using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController, Route("oauth")]
public class OauthController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly HostingOauthFactory _hostingOauthFactory;
    readonly HostingClientFactory _hostingClientFactory;

    public OauthController(Infrastructure.ApplicationContext context, HostingOauthFactory hostingOauthFactory,
        HostingClientFactory hostingClientFactory)
    {
        _context = context;
        _hostingOauthFactory = hostingOauthFactory;
        _hostingClientFactory = hostingClientFactory;
    }

    [HttpGet("authorization-url/{provider}")]
    public string GetAuthorizationUrl(string provider)
    {
        IHostingOauth oauth = _hostingOauthFactory.CreateOAuth(provider);
        return oauth.CreateAuthorizationUrl().ToString();
    }

    [HttpGet("callback/{provider}")]
    public async Task<IActionResult> Callback(string provider, string code)
    {
        IHostingOauth oauth = _hostingOauthFactory.CreateOAuth(provider);
        string token = await oauth.CreateAccessToken(code);
        IHostingClient client = _hostingClientFactory.CreateClient(provider, token);
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
