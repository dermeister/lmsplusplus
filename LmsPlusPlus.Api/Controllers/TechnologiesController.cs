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
    public async Task<IEnumerable<Infrastructure.Technology>> GetAll() => await _context.Technologies.ToArrayAsync();
}
