using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("technologies")]
public class TechnologiesController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public TechnologiesController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Technology>> GetAll() =>
        await (from t in _context.Technologies select (Response.Technology)t).ToArrayAsync();
}
