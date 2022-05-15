using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
public class AuthenticationController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly JwtGenerator _jwtGenerator;

    public AuthenticationController(Infrastructure.ApplicationContext context, JwtGenerator jwtGenerator)
    {
        _context = context;
        _jwtGenerator = jwtGenerator;
    }

    [HttpPost("sign-in")]
    public async Task<ActionResult<Response.SignIn>> SignIn(Request.SignIn signIn)
    {
        var user = await (from u in _context.Users
                          where u.Login == signIn.Login && u.PasswordHash == signIn.Password
                          select new { u.Id, u.Role }).SingleOrDefaultAsync();
        if (user is null)
            return BadRequest();
        return new Response.SignIn(_jwtGenerator.Generate(user.Id.ToString(), user.Role.ToString()));
    }
}
