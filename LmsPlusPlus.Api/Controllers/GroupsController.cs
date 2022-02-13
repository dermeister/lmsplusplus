using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("groups")]
public class GroupsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public GroupsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Infrastructure.Group>> GetAll() => await _context.Groups.ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<Infrastructure.Group?> GetById(long id) => await _context.Groups.FindAsync(id);

    [HttpPost]
    public async Task<Infrastructure.Group> Create(Request.Group requestGroup)
    {
        Infrastructure.Group databaseGroup = new()
        {
            Name = requestGroup.Name,
            TopicId = requestGroup.TopicId
        };
        EntityEntry<Infrastructure.Group> entry = _context.Add(databaseGroup);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Infrastructure.Group>> Update(long id, Request.Group requestGroup)
    {
        Infrastructure.Group? databaseGroup = await _context.Groups.FindAsync(id);
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
        Infrastructure.Group? group = await _context.Groups.FindAsync(id);
        if (group is not null)
        {
            _context.Remove(group);
            await _context.SaveChangesAsync();
        }
    }
}
