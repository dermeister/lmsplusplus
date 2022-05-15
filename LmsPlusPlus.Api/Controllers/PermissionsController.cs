using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("permissions")]
public class PermissionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PermissionsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver, Admin")]
    public async Task<Response.Permissions> Get()
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Permissions permissions = await _context.Permissions.Where(p => p.Role == credentials.UserRole).SingleAsync();
        return (Response.Permissions)permissions;
    }
}
