using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("topics")]
public class TopicsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TopicsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Infrastructure.Topic>> GetAll() => await _context.Topics.ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<Infrastructure.Topic?> GetById(long id) => await _context.Topics.FindAsync(id);

    [HttpPost]
    public async Task<Infrastructure.Topic> Create(Request.Topic requestTopic)
    {
        Infrastructure.Topic databaseTopic = new()
        {
            Name = requestTopic.Name,
            AuthorId = requestTopic.AuthorId
        };
        EntityEntry<Infrastructure.Topic> entry = _context.Add(databaseTopic);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Infrastructure.Topic>> Update(long id, Request.Topic requestTopic)
    {
        Infrastructure.Topic? databaseTopic = await _context.Topics.FindAsync(id);
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
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(id);
        if (topic is not null)
        {
            _context.Remove(topic);
            await _context.SaveChangesAsync();
        }
    }
}
