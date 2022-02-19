using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("permissions")]
public class PermissionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public PermissionsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Response.Permissions>> GetAll() =>
        await _context.Permissions.Select(p => (Response.Permissions)p).ToArrayAsync();

    [HttpGet("{role}")]
    public async Task<Response.Permissions?> GetPermissionsByRole(string role)
    {
        if (!Enum.TryParse(role, ignoreCase: true, out Infrastructure.Role parsedRole))
            return null;
        Infrastructure.Permissions? permissions = await _context.Permissions.FindAsync(parsedRole);
        if (permissions is null)
            return null;
        return (Response.Permissions)permissions;
    }

    [HttpPut("{role}")]
    public async Task<ActionResult<Response.Permissions>> Update(string role, Request.Permissions requestPermissions)
    {
        if (!Enum.TryParse(role, ignoreCase: true, out Infrastructure.Role parsedRole))
            return BadRequest();
        Infrastructure.Permissions? databasePermissions = await _context.Permissions.FindAsync(parsedRole);
        if (databasePermissions is null)
            return BadRequest();
        databasePermissions.CanCreateTask = requestPermissions.CanCreateTask;
        databasePermissions.CanUpdateTask = requestPermissions.CanUpdateTask;
        databasePermissions.CanDeleteTask = requestPermissions.CanDeleteTask;
        databasePermissions.CanUpdateVcsConfiguration = requestPermissions.CanUpdateVcsConfiguration;
        databasePermissions.CanUpdateUser = requestPermissions.CanUpdateUser;
        databasePermissions.CanCreateSolution = requestPermissions.CanCreateSolution;
        databasePermissions.CanDeleteSolution = requestPermissions.CanDeleteSolution;
        await _context.SaveChangesAsync();
        return (Response.Permissions)databasePermissions;
    }
}
