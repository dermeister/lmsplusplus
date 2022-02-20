using Microsoft.AspNetCore.Authorization;
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
    [Authorize(Roles = "Solver")]
    public async Task<IEnumerable<Response.VcsAccount>> GetAll()
    {
        long userId = Utils.GetUserIdFromClaims(User);
        return await (from a in _context.VcsAccounts where a.UserId == userId select (Response.VcsAccount)a).ToArrayAsync();
    }

    [HttpDelete("{accountId:long}")]
    [Authorize(Roles = "Solver")]
    public async Task<IActionResult> Delete(long accountId)
    {
        long userId = Utils.GetUserIdFromClaims(User);
        Infrastructure.VcsAccount? account = await _context.VcsAccounts.FindAsync(accountId);
        if (account is not null)
        {
            if (account.UserId != userId)
                return Unauthorized();
            _context.Remove(account);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
