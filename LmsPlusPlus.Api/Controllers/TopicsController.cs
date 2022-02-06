using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("topics")]
public class TopicsController : ControllerBase
{
    readonly ApplicationContext _context;

    public TopicsController(ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<DatabaseModels.Topic>> GetAll() => await _context.Topics.ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<DatabaseModels.Topic?> GetById(long id) => await _context.Topics.FindAsync(id);

    [HttpPost]
    public async Task<DatabaseModels.Topic> Create(RequestModels.Topic requestTopic)
    {
        DatabaseModels.Topic databaseTopic = new()
        {
            Name = requestTopic.Name,
            AuthorId = requestTopic.AuthorId
        };
        EntityEntry<DatabaseModels.Topic> entry = _context.Add(databaseTopic);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<DatabaseModels.Topic>> Update(long id, RequestModels.Topic requestTopic)
    {
        DatabaseModels.Topic? databaseTopic = await _context.Topics.FindAsync(id);
        if (databaseTopic is null)
            return BadRequest();
        databaseTopic.Name = requestTopic.Name;
        databaseTopic.AuthorId = requestTopic.AuthorId;
        await _context.SaveChangesAsync();
        return databaseTopic;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        DatabaseModels.Topic? topic = await _context.Topics.FindAsync(id);
        if (topic is not null)
        {
            _context.Remove(topic);
            await _context.SaveChangesAsync();
        }
    }
}
