using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("topics")]
public class TopicsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TopicsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Topic>> GetAll()
    {
        Infrastructure.Role role = Utils.GetUserRoleFromClaims(User);
        long id = Utils.GetUserIdFromClaims(User);
        return role switch
        {
            Infrastructure.Role.Author => await (from t in _context.Topics where t.AuthorId == id select (Response.Topic)t).ToArrayAsync(),
            Infrastructure.Role.Solver => await _context.Users
                .Include(u => u.Groups)
                .SelectMany(u => from g in u.Groups select (Response.Topic)g.Topic)
                .ToArrayAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<Response.Topic> Create(Request.CreateTopic requestTopic)
    {
        Infrastructure.Topic databaseTopic = new()
        {
            Name = requestTopic.Name,
            AuthorId = requestTopic.AuthorId
        };
        _context.Add(databaseTopic);
        await _context.SaveChangesAsync();
        return (Response.Topic)databaseTopic;
    }

    [HttpPut("{topicId:long}"), Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Topic>> Update(long topicId, Request.UpdateTopic requestTopic)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Topic? databaseTopic = await _context.Topics.FindAsync(topicId);
        if (databaseTopic is null)
            return BadRequest();
        if (databaseTopic.AuthorId != authorId)
            return Forbid();
        databaseTopic.Name = requestTopic.Name;
        await _context.SaveChangesAsync();
        return (Response.Topic)databaseTopic;
    }

    [HttpDelete("{topicId:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long topicId)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(topicId);
        if (topic is not null)
        {
            if (topic.AuthorId != authorId)
                return Forbid();
            _context.Remove(topic);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
