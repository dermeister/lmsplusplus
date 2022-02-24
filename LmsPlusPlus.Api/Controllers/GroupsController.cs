using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("groups")]
public class GroupsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public GroupsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Group>> GetAll()
    {
        long id = Utils.GetUserIdFromClaims(User);
        Infrastructure.Role role = Utils.GetUserRoleFromClaims(User);
        return role switch
        {
            Infrastructure.Role.Author => await (from g in _context.Groups
                                                 join t in _context.Topics on g.TopicId equals t.Id
                                                 join u in _context.Users on t.AuthorId equals u.Id
                                                 where u.Id == id
                                                 select (Response.Group)g).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from u in _context.Users.Include(u => u.Groups)
                                                 where u.Id == id
                                                 select from g in u.Groups select (Response.Group)g).SingleAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Group>> Create(Request.CreatedGroup requestGroup)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(requestGroup.TopicId);
        if (topic is null)
            return BadRequest();
        if (topic.AuthorId != authorId)
            return Forbid();
        Infrastructure.Group databaseGroup = new()
        {
            Name = requestGroup.Name,
            TopicId = requestGroup.TopicId
        };
        _context.Add(databaseGroup);
        await _context.SaveChangesAsync();
        return (Response.Group)databaseGroup;
    }

    [HttpPut("{groupId:long}"), Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Group>> Update(long groupId, Request.UpdatedGroup requestGroup)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Group? databaseGroup = await _context.Groups.Include(g => g.Topic).SingleOrDefaultAsync(g => g.Id == groupId);
        if (databaseGroup is null)
            return BadRequest();
        if (databaseGroup.Topic.AuthorId != authorId)
            return Forbid();
        databaseGroup.Name = requestGroup.Name;
        await _context.SaveChangesAsync();
        return (Response.Group)databaseGroup;
    }

    [HttpDelete("{groupId:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long groupId)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Group? group = await _context.Groups.Include(g => g.Topic).SingleOrDefaultAsync(g => g.Id == groupId);
        if (group is not null)
        {
            if (group.Topic.AuthorId != authorId)
                return Forbid();
            _context.Remove(group);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
