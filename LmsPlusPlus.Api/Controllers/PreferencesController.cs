using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("preferences"), Authorize(Roles = "Author, Solver, Admin")]
public class PreferencesController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PreferencesController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<Response.Preferences> Get()
    {
        long id = Utils.GetUserIdFromClaims(User);
        Infrastructure.Preferences preferences = await _context.Preferences.SingleAsync(p => p.UserId == id);
        return (Response.Preferences)preferences;
    }

    [HttpPut]
    public async Task<Response.Preferences> Update(Request.Preferences requestPreferences)
    {
        long id = Utils.GetUserIdFromClaims(User);
        Infrastructure.Preferences databasePreferences = await _context.Preferences.SingleAsync(p => p.UserId == id);
        databasePreferences.Theme = requestPreferences.Theme;
        await _context.SaveChangesAsync();
        return (Response.Preferences)databasePreferences;
    }
}
