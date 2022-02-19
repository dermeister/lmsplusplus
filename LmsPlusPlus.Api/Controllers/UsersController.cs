using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public UsersController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<Response.User>> GetAll() => await _context.Users.Select(u => (Response.User)u).ToArrayAsync();

    [HttpPost]
    public async Task<Response.User> Create(Request.User requestUser)
    {
        Infrastructure.User databaseUser = new()
        {
            Login = requestUser.Login,
            PasswordHash = requestUser.Password,
            FirstName = requestUser.FirstName,
            LastName = requestUser.LastName,
            Role = Infrastructure.Role.Solver
        };
        _context.Add(databaseUser);
        await _context.SaveChangesAsync();
        return (Response.User)databaseUser;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<Response.User>> Update(long id, Request.User requestUser)
    {
        Infrastructure.User? databaseUser = await _context.Users.FindAsync(id);
        if (databaseUser is null)
            return BadRequest();
        databaseUser.Login = requestUser.Login;
        databaseUser.FirstName = requestUser.FirstName;
        databaseUser.LastName = requestUser.LastName;
        databaseUser.PasswordHash = requestUser.Password;
        await _context.SaveChangesAsync();
        return (Response.User)databaseUser;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        Infrastructure.User? user = await _context.Users.FindAsync(id);
        if (user is not null)
        {
            _context.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
