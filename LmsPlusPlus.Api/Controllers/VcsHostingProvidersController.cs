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
    public async Task<IEnumerable<Infrastructure.VcsHostingProvider>> GetAll() =>
        await _context.VcsHostingProviders.ToArrayAsync();

    [HttpPost]
    public async Task<Infrastructure.VcsHostingProvider> Create(Request.RepositoryHostingProvider requestProvider)
    {
        Infrastructure.VcsHostingProvider databaseProvider = new() { Name = requestProvider.Name };
        _context.Add(databaseProvider);
        await _context.SaveChangesAsync();
        return databaseProvider;
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Infrastructure.VcsHostingProvider>> Update(int id,
        Request.RepositoryHostingProvider requestProvider)
    {
        Infrastructure.VcsHostingProvider? databaseProvider = await _context.VcsHostingProviders.FindAsync((short)id);
        if (databaseProvider is null)
            return BadRequest();
        databaseProvider.Name = requestProvider.Name;
        await _context.SaveChangesAsync();
        return databaseProvider;
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
