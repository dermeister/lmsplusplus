using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("vcs-accounts")]
public class VcsAccountsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public VcsAccountsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Infrastructure.VcsAccount>> GetAll() => await _context.VcsAccounts.ToArrayAsync();

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        Infrastructure.VcsAccount? account = await _context.VcsAccounts.FindAsync(id);
        if (account is not null)
        {
            _context.Remove(account);
            await _context.SaveChangesAsync();
        }
    }
}
