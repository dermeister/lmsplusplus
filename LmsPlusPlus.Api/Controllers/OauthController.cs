using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController, Route("oauth")]
public class OauthController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public OauthController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet("authorization-url/{provider}")]
    public string GetAuthorizationUrl(string provider)
    {
        IHostingClient hostingClient = HostingClientFactory.CreateClient(provider);
        return hostingClient.CreateAuthorizationUrl("id");
    }

    [HttpGet("callback/{provider}")]
    public async Task<IActionResult> Callback(string provider, string code)
    {
        IHostingClient hostingClient = HostingClientFactory.CreateClient(provider);
        string token = await hostingClient.CreateAuthorizationAccessToken(code, "id", "secret");
        string username = await hostingClient.GetUsername(token);
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
