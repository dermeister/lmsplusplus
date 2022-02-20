using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("tasks")]
public class TasksController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TasksController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    [Authorize(Roles = "Author, Solver")]
    public async Task<ActionResult<IEnumerable<Response.Task>>> GetAll()
    {
        Infrastructure.Role userRole = Utils.GetUserRoleFromClaims(User);
        long userId = Utils.GetUserIdFromClaims(User);
        return userRole switch
        {
            Infrastructure.Role.Author => await (from ts in _context.Tasks
                                                 join tp in _context.Topics on ts.TopicId equals tp.Id
                                                 where tp.AuthorId == userId
                                                 select (Response.Task)ts).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from g in _context.Users.Include(u => u.Groups).SelectMany(u => u.Groups)
                                                 join tp in _context.Topics on g.TopicId equals tp.Id
                                                 join ts in _context.Tasks on tp.Id equals ts.TopicId
                                                 select (Response.Task)ts).ToArrayAsync(),
            Infrastructure.Role.Admin => Unauthorized(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpGet("{taskId:long}")]
    [Authorize(Roles = "Author, Solver")]
    public async Task<ActionResult<Response.Task?>> GetById(long taskId)
    {
        Infrastructure.Role userRole = Utils.GetUserRoleFromClaims(User);
        long userId = Utils.GetUserIdFromClaims(User);
        switch (userRole)
        {
            case Infrastructure.Role.Author:
            {
                Infrastructure.Task? task = await _context.Tasks.Include(t => t.Topic).SingleOrDefaultAsync(t => t.Id == taskId);
                if (task is null)
                    return Ok(null);
                if (task.Topic.AuthorId != userId)
                    return Unauthorized();
                return (Response.Task)task;
            }
            case Infrastructure.Role.Solver:
            {
                // TODO: check if executed in single query
                var result = await (from ts in _context.Tasks
                                    join tp in _context.Topics on ts.TopicId equals tp.Id
                                    join g in _context.Groups.Include(g => g.Users) on tp.Id equals g.TopicId
                                    where ts.Id == taskId
                                    select new
                                    {
                                        Task = ts,
                                        SolverAssignedToTask = g.Users.Select(u => u.Id).Contains(userId)
                                    }).SingleOrDefaultAsync();
                if (result is null)
                    return Ok(null);
                if (!result.SolverAssignedToTask)
                    return Unauthorized();
                return (Response.Task)result.Task;
            }
            case Infrastructure.Role.Admin:
                return Unauthorized();
            default:
                throw new ArgumentOutOfRangeException();
        }
    }

    [HttpPost]
    [Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Create(Request.Task requestTask)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(requestTask.TopicId);
        if (topic is null)
            return BadRequest();
        if (topic.AuthorId != authorId)
            return Unauthorized();
        Infrastructure.Task databaseTask = new()
        {
            Title = requestTask.Title,
            Description = requestTask.Description,
            TopicId = requestTask.TopicId,
            Technologies = ConvertTechnologyIdsToTrackedTechnologies(requestTask.TechnologyIds).ToList()
        };
        _context.Add(databaseTask);
        await _context.SaveChangesAsync();
        return (Response.Task)databaseTask;
    }

    [HttpPut("{id:long}")]
    [Authorize(Roles = "Author")]
    public async Task<ActionResult<Response.Task>> Update(long id, Request.Task requestTask)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Task? databaseTask =
            await _context.Tasks.Include(t => t.Technologies).Include(t => t.Topic).FirstOrDefaultAsync(t => t.Id == id);
        if (databaseTask is null)
            return BadRequest();
        if (databaseTask.Topic.AuthorId != authorId)
            return Unauthorized();
        databaseTask.Title = requestTask.Title;
        databaseTask.Description = requestTask.Description;
        databaseTask.TopicId = requestTask.TopicId;
        // TODO: handle "entity attached" exception
        databaseTask.Technologies = ConvertTechnologyIdsToTrackedTechnologies(requestTask.TechnologyIds).ToList();
        await _context.SaveChangesAsync();
        return (Response.Task)databaseTask;
    }

    [HttpDelete("{id:long}")]
    [Authorize(Roles = "Author")]
    public async Task<IActionResult> Delete(long id)
    {
        long authorId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Task? task = await _context.Tasks.Include(t => t.Topic).SingleOrDefaultAsync(t => t.Id == id);
        if (task is not null)
        {
            if (task.Topic.AuthorId != authorId)
                return Unauthorized();
            _context.Remove(task);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }

    IEnumerable<Infrastructure.Technology> ConvertTechnologyIdsToTrackedTechnologies(IEnumerable<short> ids)
    {
        foreach (short id in ids)
        {
            Infrastructure.Technology technology = new() { Id = id };
            _context.Attach(technology);
            yield return technology;
        }
    }
}
