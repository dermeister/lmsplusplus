using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api;

[ApiController, Route("groups")]
public class GroupsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public GroupsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Group>> GetAll()
    {
        AuthorizationCredentials credentials = new(User);
        return credentials.UserRole switch
        {
            Infrastructure.Role.Author => await (from u in _context.Users
                                                 join t in _context.Topics on u.Id equals t.AuthorId
                                                 join g in _context.Groups on t.Id equals g.TopicId
                                                 where u.Id == credentials.UserId
                                                 select (Response.Group)g).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from u in _context.Users.Include(u => u.Groups)
                                                 where u.Id == credentials.UserId
                                                 select from g in u.Groups select (Response.Group)g).SingleAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Group>> Create(Request.CreateGroup requestGroup)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(requestGroup.TopicId);
        if (topic is null)
        {
            ModelState.AddModelError(nameof(requestGroup.TopicId), $"Topic with id {requestGroup.TopicId} does not exist.");
            return ValidationProblem();
        }
        if (topic.AuthorId != credentials.UserId)
            return Forbid();
        Infrastructure.Group databaseGroup = new()
        {
            Name = requestGroup.Name,
            TopicId = requestGroup.TopicId
        };
        _context.Add(databaseGroup);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.StringDataRightTruncation })
        {
            ModelState.AddModelError(nameof(requestGroup.Name), $"Name is too long.");
            return ValidationProblem();
        }
        return (Response.Group)databaseGroup;
    }

    [HttpPut("{groupId:long}"), Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Group>> Update(long groupId, Request.UpdateGroup requestGroup)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Group? databaseGroup = await _context.Groups.Include(g => g.Topic).SingleOrDefaultAsync(g => g.Id == groupId);
        if (databaseGroup is null)
            return Problem(detail: "Group does not exist.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot update group.");
        if (databaseGroup.Topic.AuthorId != credentials.UserId)
            return Forbid();
        databaseGroup.Name = requestGroup.Name;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.StringDataRightTruncation })
        {
            ModelState.AddModelError(nameof(requestGroup.Name), $"Name is too long.");
            return ValidationProblem();
        }
        return (Response.Group)databaseGroup;
    }

    [HttpDelete("{groupId:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long groupId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Group? group = await _context.Groups.Include(g => g.Topic).SingleOrDefaultAsync(g => g.Id == groupId);
        if (group is not null)
        {
            if (group.Topic.AuthorId != credentials.UserId)
                return Forbid();
            _context.Remove(group);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
