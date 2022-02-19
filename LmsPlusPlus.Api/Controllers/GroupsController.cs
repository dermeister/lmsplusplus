using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("groups")]
public class GroupsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public GroupsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Response.Group>> GetAll() => await _context.Groups.Select(g => (Response.Group)g).ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<Response.Group?> GetById(long id)
    {
        Infrastructure.Group? group = await _context.Groups.FindAsync(id);
        if (group is null)
            return null;
        return (Response.Group)group;
    }

    [HttpPost]
    public async Task<Response.Group> Create(Request.Group requestGroup)
    {
        Infrastructure.Group databaseGroup = new()
        {
            Name = requestGroup.Name,
            TopicId = requestGroup.TopicId
        };
        _context.Add(databaseGroup);
        await _context.SaveChangesAsync();
        return (Response.Group)databaseGroup;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Response.Group>> Update(long id, Request.Group requestGroup)
    {
        Infrastructure.Group? databaseGroup = await _context.Groups.FindAsync(id);
        if (databaseGroup is null)
            return BadRequest();
        databaseGroup.Name = requestGroup.Name;
        databaseGroup.TopicId = requestGroup.TopicId;
        await _context.SaveChangesAsync();
        return (Response.Group)databaseGroup;
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
