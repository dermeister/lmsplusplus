using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("repository-hosting-providers")]
public class RepositoryHostingProvidersController : ControllerBase
{
    readonly ApplicationContext _context;

    public RepositoryHostingProvidersController(ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<DatabaseModels.RepositoryHostingProvider>> GetAll() =>
        await _context.RepositoryHostingProviders.ToArrayAsync();

    [HttpPost]
    public async Task<DatabaseModels.RepositoryHostingProvider> Create(RequestModels.RepositoryHostingProvider requestProvider)
    {
        DatabaseModels.RepositoryHostingProvider databaseProvider = new() { Name = requestProvider.Name };
        _context.Add(databaseProvider);
        await _context.SaveChangesAsync();
        return databaseProvider;
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DatabaseModels.RepositoryHostingProvider>> Update(int id,
        RequestModels.RepositoryHostingProvider requestProvider)
    {
        DatabaseModels.RepositoryHostingProvider? databaseProvider = await _context.RepositoryHostingProviders.FindAsync((short)id);
        if (databaseProvider is null)
            return BadRequest();
        databaseProvider.Name = requestProvider.Name;
        await _context.SaveChangesAsync();
        return databaseProvider;
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id)
    {
        DatabaseModels.RepositoryHostingProvider? provider = await _context.RepositoryHostingProviders.FindAsync((short)id);
        if (provider is not null)
        {
            _context.Remove(provider);
            await _context.SaveChangesAsync();
        }
    }
}
