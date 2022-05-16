using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("vcs-hosting-providers")]
public class RepositoryHostingProvidersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public RepositoryHostingProvidersController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Solver")]
    public async Task<IEnumerable<Response.VcsHostingProvider>> GetAll() =>
        await (from p in _context.VcsHostingProviders select (Response.VcsHostingProvider)p).ToArrayAsync();
}
