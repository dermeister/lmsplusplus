using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("groups")]
public class GroupsController : ControllerBase
{
    readonly ApplicationContext _context;

    public GroupsController(ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<DatabaseModels.Group>> GetAll() => await _context.Groups.ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<DatabaseModels.Group?> GetById(long id) => await _context.Groups.FindAsync(id);

    [HttpPost]
    public async Task<DatabaseModels.Group> Create(RequestModels.Group requestGroup)
    {
        DatabaseModels.Group databaseGroup = new()
        {
            Name = requestGroup.Name,
            TopicId = requestGroup.TopicId
        };
        EntityEntry<DatabaseModels.Group> entry = _context.Add(databaseGroup);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<DatabaseModels.Group>> Update(long id, RequestModels.Group requestGroup)
    {
        DatabaseModels.Group? databaseGroup = await _context.Groups.FindAsync(id);
        if (databaseGroup is null)
            return BadRequest();
        databaseGroup.Name = requestGroup.Name;
        databaseGroup.TopicId = requestGroup.TopicId;
        await _context.SaveChangesAsync();
        return databaseGroup;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        DatabaseModels.Group? group = await _context.Groups.FindAsync(id);
        if (group is not null)
        {
            _context.Remove(group);
            await _context.SaveChangesAsync();
        }
    }
}
