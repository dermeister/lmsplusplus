using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api;

[ApiController, Route("tasks")]
public class TasksController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TasksController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<ActionResult<IEnumerable<Response.Task>>> GetAll()
    {
        Infrastructure.Role userRole = Utils.GetUserRoleFromClaims(User);
        long userId = Utils.GetUserIdFromClaims(User);
        return userRole switch
        {
            Infrastructure.Role.Author => await (from ts in _context.Tasks.Include(t => t.Technologies)
                                                 join tp in _context.Topics on ts.TopicId equals tp.Id
                                                 where tp.AuthorId == userId
                                                 select (Response.Task)ts).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from g in _context.Users
                                                     .Include(u => u.Groups)
                                                     .Where(u => u.Id == userId)
                                                     .SelectMany(u => u.Groups)
                                                 join tp in _context.Topics on g.TopicId equals tp.Id
                                                 join ts in _context.Tasks.Include(t => t.Technologies) on tp.Id equals ts.TopicId
                                                 select (Response.Task)ts).ToArrayAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Create(Request.CreateTask requestTask)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(requestTask.TopicId);
        if (topic is null)
        {
            ModelState.AddModelError(key: "TopicId", $"Topic with id {requestTask.TopicId} does not exist.");
            return ValidationProblem();
        }
        if (topic.AuthorId != authorId)
            return Forbid();
        List<Infrastructure.Technology> technologies =
            await _context.Technologies.Where(t => requestTask.TechnologyIds.Contains(t.Id)).ToListAsync();
        Infrastructure.Task databaseTask = new()
        {
            Title = requestTask.Title,
            Description = requestTask.Description,
            TopicId = requestTask.TopicId,
            Technologies = technologies
        };
        _context.Add(databaseTask);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException postgresException)
        {
            if (postgresException is { SqlState: PostgresErrorCodes.ForeignKeyViolation, ConstraintName: "fk_tasks_topic_id" })
            {
                ModelState.AddModelError(key: "TopicId", $"Topic with id {requestTask.TopicId} does not exist.");
                return ValidationProblem();
            }
            throw;
        }
        catch (PostgresException postgresException)
        {
            if (postgresException is { SqlState: PostgresErrorCodes.RaiseException })
            {
                ModelState.AddModelError(key: "TechnologyIds", errorMessage: "Task must contain at least one technology.");
                return ValidationProblem();
            }
            throw;
        }
        return (Response.Task)databaseTask;
    }

    [HttpPut("{taskId:long}"), Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Update(long taskId, Request.UpdateTask requestTask)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Task? databaseTask =
            await _context.Tasks.Include(t => t.Technologies).Include(t => t.Topic).FirstOrDefaultAsync(t => t.Id == taskId);
        if (databaseTask is null)
            return BadRequest();
        if (databaseTask.Topic.AuthorId != authorId)
            return Forbid();
        List<Infrastructure.Technology> technologies =
            await _context.Technologies.Where(t => requestTask.TechnologyIds.Contains(t.Id)).ToListAsync();
        databaseTask.Title = requestTask.Title;
        databaseTask.Description = requestTask.Description;
        databaseTask.Technologies = technologies;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (PostgresException postgresException)
        {
            if (postgresException is { SqlState: PostgresErrorCodes.RaiseException })
            {
                ModelState.AddModelError(key: "TechnologyIds", errorMessage: "Task must contain at least one technology.");
                return ValidationProblem();
            }
            throw;
        }
        return (Response.Task)databaseTask;
    }

    [HttpDelete("{id:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long id)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Task? task = await _context.Tasks.Include(t => t.Topic).SingleOrDefaultAsync(t => t.Id == id);
        if (task is not null)
        {
            if (task.Topic.AuthorId != authorId)
                return Forbid();
            _context.Remove(task);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
