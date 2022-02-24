using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Authorize(Roles = "Author, Solver, Admin"), Route("permissions")]
public class PermissionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PermissionsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<Response.Permissions> GetPermissions()
    {
        Infrastructure.Role role = Utils.GetUserRoleFromClaims(User);
        Infrastructure.Permissions permissions = await _context.Permissions.Where(p => p.Role == role).SingleAsync();
        return (Response.Permissions)permissions;
    }
}
