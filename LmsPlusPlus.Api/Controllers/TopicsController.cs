using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api;

[ApiController, Route("topics")]
public class TopicsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TopicsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Topic>> GetAll()
    {
        AuthorizationCredentials credentials = new(User);
        return credentials.UserRole switch
        {
            Infrastructure.Role.Author => await (from t in _context.Topics
                                                 where t.AuthorId == credentials.UserId
                                                 select (Response.Topic)t).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from u in _context.Users.Include(u => u.Groups)
                                                 where u.Id == credentials.UserId
                                                 select from g in u.Groups select (Response.Topic)g.Topic).SingleAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Topic>> Create(Request.CreateTopic requestTopic)
    {
        AuthorizationCredentials credentials = new(User);
        if (requestTopic.AuthorId != credentials.UserId)
            return Forbid();
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
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Topic? databaseTopic = await _context.Topics.FindAsync(topicId);
        if (databaseTopic is null)
            return Problem(detail: "Topic does not exist.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot update topic.");
        if (databaseTopic.AuthorId != credentials.UserId)
            return Forbid();
        databaseTopic.Name = requestTopic.Name;
        await _context.SaveChangesAsync();
        return (Response.Topic)databaseTopic;
    }

    [HttpDelete("{topicId:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long topicId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(topicId);
        if (topic is not null)
        {
            if (topic.AuthorId != credentials.UserId)
                return Forbid();
            _context.Remove(topic);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
