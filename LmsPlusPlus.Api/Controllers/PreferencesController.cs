using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("preferences")]
public class PreferencesController : ControllerBase
{
    readonly ApplicationContext _context;

    public PreferencesController(ApplicationContext context) => _context = context;

    [HttpGet("{userId:long}")]
    public async Task<DatabaseModels.Preferences> Get(long userId)
    {
        // TODO: userId should be taken from authorization token
        return await _context.Preferences.FirstAsync(p => p.UserId == userId);
    }

    [HttpPut("{userId:long}")]
    public async Task<DatabaseModels.Preferences> Update(long userId, RequestModels.Preferences requestPreferences)
    {
        // TODO: userId should be taken from authorization token
        DatabaseModels.Preferences databasePreferences = await _context.Preferences.FirstAsync(p => p.UserId == userId);
        databasePreferences.Theme = requestPreferences.Theme;
        await _context.SaveChangesAsync();
        return databasePreferences;
    }
}
