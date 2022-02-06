using LmsPlusPlus.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    readonly ApplicationContext _context;

    public UsersController(ApplicationContext context) => _context = context;

    [HttpGet]
    public async Task<IEnumerable<DatabaseModels.User>> GetAll() => await _context.Users.ToArrayAsync();

    [HttpPost]
    public async Task<DatabaseModels.User> Create(RequestModels.User requestUser)
    {
        DatabaseModels.User databaseUser = new()
        {
            Login = requestUser.Login,
            PasswordHash = requestUser.Password,
            FirstName = requestUser.FirstName,
            LastName = requestUser.LastName,
            Role = DatabaseModels.Role.Solver
        };
        _context.Add(databaseUser);
        await _context.SaveChangesAsync();
        return databaseUser;
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<DatabaseModels.User>> Update(long id, RequestModels.User requestUser)
    {
        DatabaseModels.User? databaseUser = await _context.Users.FindAsync(id);
        if (databaseUser is null)
            return BadRequest();
        databaseUser.Login = requestUser.Login;
        databaseUser.FirstName = requestUser.FirstName;
        databaseUser.LastName = requestUser.LastName;
        databaseUser.PasswordHash = requestUser.Password;
        await _context.SaveChangesAsync();
        return databaseUser;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        DatabaseModels.User? user = await _context.Users.FindAsync(id);
        if (user is not null)
        {
            _context.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
