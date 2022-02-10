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
    public async Task<IEnumerable<Infrastructure.Task>> GetAll() => await _context.Tasks.ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<Infrastructure.Task?> GetById(long id) => await _context.Tasks.FindAsync(id);

    [HttpPost]
    public async Task<Infrastructure.Task> Create(RequestModels.Task requestTask)
    {
        Infrastructure.Task databaseTask = new()
        {
            Title = requestTask.Title,
            Description = requestTask.Description,
            TopicId = requestTask.TopicId
        };
        _context.Add(databaseTask);
        await _context.SaveChangesAsync();
        return databaseTask;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Infrastructure.Task>> Update(long id, RequestModels.Task requestTask)
    {
        Infrastructure.Task? databaseTask = await _context.Tasks.FindAsync(id);
        if (databaseTask is null)
            return BadRequest();
        databaseTask.Title = requestTask.Title;
        databaseTask.Description = requestTask.Description;
        databaseTask.TopicId = requestTask.TopicId;
        await _context.SaveChangesAsync();
        return databaseTask;
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
}
