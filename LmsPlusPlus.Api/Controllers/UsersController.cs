using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController, Route("users")]
public class UsersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public UsersController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Admin, Author, Solver")]
    public async Task<Response.User> Get()
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.User user = (await _context.Users.FindAsync(credentials.UserId))!;
        return (Response.User)user;
    }

    [HttpGet("solvers"), Authorize(Roles = "Author")]
    public async Task<IEnumerable<Response.User>> GetAllSolvers()
    {
        AuthorizationCredentials credentials = new(User);
        IEnumerable<IEnumerable<Infrastructure.User>> groupedSolvers = await (from topic in _context.Topics
                                                                              join @group in _context.Groups.Include(g => g.Users) on topic.Id equals @group.TopicId
                                                                              where topic.AuthorId == credentials.UserId
                                                                              select @group.Users).ToListAsync();
        return groupedSolvers.SelectMany(users => users).Select(u => (Response.User)u);
    }
}
