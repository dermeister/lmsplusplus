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
    public async Task<Infrastructure.Preferences> Get(long userId)
    {
        // TODO: userId should be taken from authorization token
        return await _context.Preferences.FirstAsync(p => p.UserId == userId);
    }

    [HttpPut("{userId:long}")]
    public async Task<Infrastructure.Preferences> Update(long userId, Request.Preferences requestPreferences)
    {
        // TODO: userId should be taken from authorization token
        Infrastructure.Preferences databasePreferences = await _context.Preferences.FirstAsync(p => p.UserId == userId);
        databasePreferences.Theme = requestPreferences.Theme;
        await _context.SaveChangesAsync();
        return databasePreferences;
    }
}
