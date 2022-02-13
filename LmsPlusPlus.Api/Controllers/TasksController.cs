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
    public async Task<IEnumerable<Response.Task>> GetAll()
    {
        return await _context.Tasks.Include(t => t.Technologies).Select(t => (Response.Task)t).ToArrayAsync();
    }

    [HttpGet("{id:long}")]
    public async Task<Response.Task?> GetById(long id)
    {
        Infrastructure.Task? task = await _context.Tasks.FindAsync(id);
        if (task is null)
            return null;
        return (Response.Task)task;
    }

    [HttpPost]
    public async Task<Response.Task> Create(Request.Task requestTask)
    {
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
    public async Task<ActionResult<Response.Task>> Update(long id, Request.Task requestTask)
    {
        Infrastructure.Task? databaseTask = await _context.Tasks.Include(t => t.Technologies).FirstOrDefaultAsync(t => t.Id == id);
        if (databaseTask is null)
            return BadRequest();
        databaseTask.Title = requestTask.Title;
        databaseTask.Description = requestTask.Description;
        databaseTask.TopicId = requestTask.TopicId;
        // TODO: handle "entity attached" exception
        databaseTask.Technologies = ConvertTechnologyIdsToTrackedTechnologies(requestTask.TechnologyIds).ToList();
        await _context.SaveChangesAsync();
        return (Response.Task)databaseTask;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        Infrastructure.Task? task = await _context.Tasks.FindAsync(id);
        if (task is not null)
        {
            _context.Remove(task);
            await _context.SaveChangesAsync();
        }
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
