using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("preferences")]
public class PreferencesController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PreferencesController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver, Admin")]
    public async Task<Response.Preferences> Get()
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Preferences preferences = await _context.Preferences.SingleAsync(p => p.UserId == credentials.UserId);
        return (Response.Preferences)preferences;
    }

    [HttpPut, Authorize(Roles = "Author, Solver, Admin")]
    public async Task<Response.Preferences> Update(Request.Preferences requestPreferences)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Preferences databasePreferences = await _context.Preferences.SingleAsync(p => p.UserId == credentials.UserId);
        databasePreferences.Theme = requestPreferences.Theme;
        await _context.SaveChangesAsync();
        return (Response.Preferences)databasePreferences;
    }
}
