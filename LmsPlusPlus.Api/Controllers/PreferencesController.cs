using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("preferences")]
public class PreferencesController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PreferencesController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet("{userId:long}")]
    public async Task<Response.Preferences> Get(long userId)
    {
        // TODO: userId should be taken from authorization token
        Infrastructure.Preferences preferences = await _context.Preferences.SingleAsync(p => p.UserId == userId);
        return (Response.Preferences)preferences;
    }

    [HttpPut("{userId:long}")]
    public async Task<Response.Preferences> Update(long userId, Request.Preferences requestPreferences)
    {
        // TODO: userId should be taken from authorization token
        Infrastructure.Preferences databasePreferences = await _context.Preferences.SingleAsync(p => p.UserId == userId);
        databasePreferences.Theme = requestPreferences.Theme;
        await _context.SaveChangesAsync();
        return (Response.Preferences)databasePreferences;
    }
}
