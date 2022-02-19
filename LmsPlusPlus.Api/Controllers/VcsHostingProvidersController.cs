using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("vcs-hosting-providers")]
public class RepositoryHostingProvidersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public RepositoryHostingProvidersController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Response.VcsHostingProvider>> GetAll() =>
        await _context.VcsHostingProviders.Select(p => (Response.VcsHostingProvider)p).ToArrayAsync();

    [HttpPost]
    public async Task<Response.VcsHostingProvider> Create(Request.VcsHostingProvider requestProvider)
    {
        Infrastructure.VcsHostingProvider databaseProvider = new() { Name = requestProvider.Name };
        _context.Add(databaseProvider);
        await _context.SaveChangesAsync();
        return (Response.VcsHostingProvider)databaseProvider;
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Response.VcsHostingProvider>> Update(int id,
        Request.VcsHostingProvider requestProvider)
    {
        Infrastructure.VcsHostingProvider? databaseProvider = await _context.VcsHostingProviders.FindAsync((short)id);
        if (databaseProvider is null)
            return BadRequest();
        databaseProvider.Name = requestProvider.Name;
        await _context.SaveChangesAsync();
        return (Response.VcsHostingProvider)databaseProvider;
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id)
    {
        Infrastructure.VcsHostingProvider? provider = await _context.VcsHostingProviders.FindAsync((short)id);
        if (provider is not null)
        {
            _context.Remove(provider);
            await _context.SaveChangesAsync();
        }
    }
}
