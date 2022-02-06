using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("permissions")]
public class PermissionsController : ControllerBase
{
    readonly ApplicationContext _context;

    public PermissionsController(ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<DatabaseModels.Permissions>> GetAll() => await _context.Permissions.ToArrayAsync();

    [HttpGet("{role}")]
    public async Task<DatabaseModels.Permissions?> GetPermissionsByRole(string role)
    {
        if (!Enum.TryParse(role, ignoreCase: true, out DatabaseModels.Role parsedRole))
            return null;
        return await _context.Permissions.FindAsync(parsedRole);
    }

    [HttpPut("{role}")]
    public async Task<ActionResult<DatabaseModels.Permissions>> Update(string role, RequestModels.Permissions requestPermissions)
    {
        if (!Enum.TryParse(role, ignoreCase: true, out DatabaseModels.Role parsedRole))
            return BadRequest();
        DatabaseModels.Permissions? databasePermissions = await _context.Permissions.FindAsync(parsedRole);
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
