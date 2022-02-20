using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Authorize]
[Route("permissions")]
public class PermissionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PermissionsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<Response.Permissions> GetPermissions()
    {
        long id = Utils.GetUserIdFromClaims(User);
        Infrastructure.Permissions permissions = await (from u in _context.Users
                                                        join p in _context.Permissions on u.Role equals p.Role
                                                        where u.Id == id
                                                        select p).SingleAsync();
        return (Response.Permissions)permissions;
    }
}
