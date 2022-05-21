using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("vcs-accounts")]
public class VcsAccountsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public VcsAccountsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Solver")]
    public async Task<IEnumerable<Response.VcsAccount>> GetAll()
    {
        AuthorizationCredentials credentials = new(User);
        return await (from a in _context.VcsAccounts
                      where a.UserId == credentials.UserId
                      select (Response.VcsAccount)a).ToArrayAsync();
    }

    [HttpPut("{accountId:long}/make-account"), Authorize(Roles = "Solver")]
    public async Task<IActionResult> SetActiveAccount(long accountId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.VcsAccount? account = await _context.VcsAccounts.SingleOrDefaultAsync(a => a.Id == accountId);
        if (account is null)
            return Problem(detail: $"Account with id {accountId} does not exist.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot set active account.");
        if (account.UserId != credentials.UserId)
            return Forbid();
        Infrastructure.ActiveVcsAccount? activeAccount = await _context.ActiveVcsAccounts.SingleOrDefaultAsync(a => a.UserId == credentials.UserId);
        if (activeAccount is not null)
            _context.Remove(activeAccount);
        Infrastructure.ActiveVcsAccount newActiveAccount = new()
        {
            UserId = credentials.UserId,
            VcsAccountId = accountId
        };
        _context.Add(newActiveAccount);
        return Ok();
    }

    [HttpDelete("{accountId:long}"), Authorize(Roles = "Solver")]
    public async Task<IActionResult> Delete(long accountId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.VcsAccount? account = await _context.VcsAccounts.FindAsync(accountId);
        if (account is not null)
        {
            if (account.UserId != credentials.UserId)
                return Forbid();
            _context.Remove(account);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
