using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("technologies")]
public class TechnologiesController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TechnologiesController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    [Authorize(Roles = "Author, Admin")]
    public async Task<IEnumerable<Response.Technology>> GetAll() =>
        await _context.Technologies.Select(t => (Response.Technology)t).ToArrayAsync();

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task Delete(int id)
    {
        Infrastructure.Technology? technology = await _context.Technologies.FindAsync((short)id);
        if (technology is not null)
        {
            _context.Remove(technology);
            await _context.SaveChangesAsync();
        }
    }
}
