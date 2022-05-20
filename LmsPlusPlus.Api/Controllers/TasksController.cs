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
        AuthorizationCredentials credentials = new(User);
        return credentials.UserRole switch
        {
            Infrastructure.Role.Author => await (from task in _context.Tasks.Include(t => t.Technologies)
                                                 join topic in _context.Topics on task.TopicId equals topic.Id
                                                 where topic.AuthorId == credentials.UserId
                                                 select (Response.Task)task).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from user in _context.Users
                                                     .Include(u => u.Groups)
                                                     .Where(u => u.Id == credentials.UserId)
                                                     .SelectMany(u => u.Groups)
                                                 join topic in _context.Topics on user.TopicId equals topic.Id
                                                 join task in _context.Tasks.Include(t => t.Technologies) on topic.Id equals task.TopicId
                                                 select (Response.Task)task).ToArrayAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Create(Request.CreateTask requestTask)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(requestTask.TopicId);
        if (topic is null)
        {
            ModelState.AddModelError(nameof(requestTask.TopicId), $"Topic with id {requestTask.TopicId} does not exist.");
            return ValidationProblem();
        }
        if (topic.AuthorId != credentials.UserId)
            return Forbid();
        Infrastructure.Technology[] technologies = await _context.Technologies.Where(t => requestTask.TechnologyIds.Contains(t.Id)).ToArrayAsync();
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
        catch (PostgresException e) when (e is { SqlState: PostgresErrorCodes.RaiseException })
        {
            return Problem(detail: "Task must contain at least one technology.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot create task.");
        }
        return (Response.Task)databaseTask;
    }

    [HttpPut("{taskId:long}"), Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Update(long taskId, Request.UpdateTask requestTask)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Task? databaseTask = await _context.Tasks
            .Include(t => t.Technologies)
            .Include(t => t.Topic)
            .FirstOrDefaultAsync(t => t.Id == taskId);
        if (databaseTask is null)
            return Problem(detail: $"Task with id {taskId} does not exist.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot update task.");
        if (databaseTask.Topic.AuthorId != credentials.UserId)
            return Forbid();
        Infrastructure.Technology[] technologies = await _context.Technologies.Where(t => requestTask.TechnologyIds.Contains(t.Id)).ToArrayAsync();
        databaseTask.Title = requestTask.Title;
        databaseTask.Description = requestTask.Description;
        databaseTask.Technologies = technologies;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (PostgresException e) when (e is { SqlState: PostgresErrorCodes.RaiseException })
        {
            return Problem(detail: "Task must contain at least one technology.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot update task.");
        }
        return (Response.Task)databaseTask;
    }

    [HttpDelete("{id:long}"), Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long id)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Task? task = await _context.Tasks.Include(t => t.Topic).SingleOrDefaultAsync(t => t.Id == id);
        if (task is not null)
        {
            if (task.Topic.AuthorId != credentials.UserId)
                return Forbid();
            _context.Remove(task);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
