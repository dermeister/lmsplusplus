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
    public async Task<IEnumerable<Infrastructure.Permissions>> GetAll() => await _context.Permissions.ToArrayAsync();

    [HttpGet("{role}")]
    public async Task<Infrastructure.Permissions?> GetPermissionsByRole(string role)
    {
        if (!Enum.TryParse(role, ignoreCase: true, out Infrastructure.Role parsedRole))
            return null;
        return await _context.Permissions.FindAsync(parsedRole);
    }

    [HttpPut("{role}")]
    public async Task<ActionResult<Infrastructure.Permissions>> Update(string role, RequestModels.Permissions requestPermissions)
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
        return databasePermissions;
    }
}
