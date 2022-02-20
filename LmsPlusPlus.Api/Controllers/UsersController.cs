using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public UsersController(Infrastructure.ApplicationContext context) => _context = context;

    [Authorize(Roles = "Admin, Author, Solver")]
    public async Task<Response.User> GetUser()
    {
        long id = Utils.GetUserIdFromClaims(User);
        Infrastructure.User user = (await _context.Users.FindAsync(id))!;
        return (Response.User)user;
    }
}
