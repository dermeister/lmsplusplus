using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController, Route("oauth")]
public class OauthController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public OauthController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet("authorization-url/{providerId}"), Authorize(Roles = "Solver")]
    public async Task<ActionResult<string>> GetAuthorizationUrl(string providerId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.VcsHostingProvider? provider = await _context.VcsHostingProviders.FindAsync(providerId);
        if (provider is null)
            return Problem(detail: $"Provider with id {providerId} does not exist.", statusCode: StatusCodes.Status400BadRequest,
            title: "Cannot get authorization url.");
        IHostingClient hostingClient = HostingClientFactory.CreateClient(providerId);
        return hostingClient.CreateAuthorizationUrl(provider.OauthClientId, credentials.UserId);
    }

    [HttpGet("callback/{providerId}")]
    public async Task<IActionResult> Callback(string providerId, string code, string state)
    {
        Infrastructure.VcsHostingProvider? provider = await _context.VcsHostingProviders.FindAsync(providerId);
        if (provider is null)
            return Problem(detail: $"Provider with id {providerId} does not exist.", statusCode: StatusCodes.Status400BadRequest,
            title: "Cannot invoke callback.");
        IHostingClient hostingClient = HostingClientFactory.CreateClient(providerId);
        string token = await hostingClient.CreateAuthorizationAccessToken(code, provider.OauthClientId, provider.OauthClientSecret);
        string username = await hostingClient.GetUsername(token);
        Infrastructure.VcsAccount account = new()
        {
            Name = username,
            AccessToken = token,
            IsActive = false,
            HostingProviderId = providerId,
            UserId = long.Parse(state)
        };
        _context.Add(account);
        await _context.SaveChangesAsync();
        return Redirect("/authorization-redirect.html");
    }
}
