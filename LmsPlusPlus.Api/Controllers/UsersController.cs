using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
}
