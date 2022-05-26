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

    [HttpPut("{accountId:long}"), Authorize(Roles = "Solver")]
    public async Task<ActionResult<Response.VcsAccount>> Update(long accountId, Request.VcsAccount requestAccount)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.VcsAccount? databaseAccount = await _context.VcsAccounts.SingleOrDefaultAsync(a => a.Id == accountId);
        if (databaseAccount is null)
            return Problem(detail: $"Account with id {accountId} does not exist.", statusCode: StatusCodes.Status400BadRequest,
            title: "Cannot update account.");
        if (databaseAccount.UserId != credentials.UserId)
            return Forbid();
        if (requestAccount.IsActive)
        {
            Infrastructure.VcsAccount? databaseActiveAccount = await _context.VcsAccounts
                .SingleOrDefaultAsync(a => a.UserId == credentials.UserId && a.IsActive);
            if (databaseActiveAccount is not null)
                databaseActiveAccount.IsActive = false;
        }
        databaseAccount.IsActive = requestAccount.IsActive;
        await _context.SaveChangesAsync();
        return (Response.VcsAccount)databaseAccount;
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
