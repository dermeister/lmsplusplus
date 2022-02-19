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
    public async Task<IEnumerable<Response.Topic>> GetAll() => await _context.Topics.Select(t => (Response.Topic)t).ToArrayAsync();

    [HttpGet("{id:long}")]
    public async Task<Response.Topic?> GetById(long id)
    {
        Infrastructure.Topic? topic = await _context.Topics.FindAsync(id);
        if (topic is null)
            return null;
        return (Response.Topic)topic;
    }

    [HttpPost]
    public async Task<Response.Topic> Create(Request.Topic requestTopic)
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

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Response.Topic>> Update(long id, Request.Topic requestTopic)
    {
        Infrastructure.Topic? databaseTopic = await _context.Topics.FindAsync(id);
        if (databaseTopic is null)
            return BadRequest();
        databaseTopic.Name = requestTopic.Name;
        databaseTopic.AuthorId = requestTopic.AuthorId;
        await _context.SaveChangesAsync();
        return (Response.Topic)databaseTopic;
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
