using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("repository-hosting-providers")]
public class RepositoryHostingProvidersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public RepositoryHostingProvidersController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Infrastructure.RepositoryHostingProvider>> GetAll() =>
        await _context.RepositoryHostingProviders.ToArrayAsync();

    [HttpPost]
    public async Task<Infrastructure.RepositoryHostingProvider> Create(RequestModels.RepositoryHostingProvider requestProvider)
    {
        Infrastructure.RepositoryHostingProvider databaseProvider = new() { Name = requestProvider.Name };
        _context.Add(databaseProvider);
        await _context.SaveChangesAsync();
        return databaseProvider;
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Infrastructure.RepositoryHostingProvider>> Update(int id,
        RequestModels.RepositoryHostingProvider requestProvider)
    {
        Infrastructure.RepositoryHostingProvider? databaseProvider = await _context.RepositoryHostingProviders.FindAsync((short)id);
        if (databaseProvider is null)
            return BadRequest();
        databaseProvider.Name = requestProvider.Name;
        await _context.SaveChangesAsync();
        return databaseProvider;
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id)
    {
        Infrastructure.RepositoryHostingProvider? provider = await _context.RepositoryHostingProviders.FindAsync((short)id);
        if (provider is not null)
        {
            _context.Remove(provider);
            await _context.SaveChangesAsync();
        }
    }
}
