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
        Infrastructure.Role userRole = Utils.GetUserRoleFromClaims(User);
        long userId = Utils.GetUserIdFromClaims(User);
        return userRole switch
        {
            Infrastructure.Role.Author => await (from t in _context.Topics where t.AuthorId == userId select (Response.Topic)t)
                .ToArrayAsync(),
            Infrastructure.Role.Solver => await (from u in _context.Users.Include(u => u.Groups)
                                                 where u.Id == userId
                                                 select from g in u.Groups select (Response.Topic)g.Topic).SingleAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Topic>> Create(Request.CreateTopic requestTopic)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        if (requestTopic.AuthorId != authorId)
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
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.InnerException is PostgresException postgresException)
            {
                if (postgresException is { SqlState: PostgresErrorCodes.ForeignKeyViolation, ConstraintName: "fk_tasks_topic_id" })
                {
                    ModelState.AddModelError(key: "TopicId", $"Topic with id {topicId} is used by tasks.");
                    return ValidationProblem();
                }
                throw;
            }
        }
        return Ok();
    }
}
