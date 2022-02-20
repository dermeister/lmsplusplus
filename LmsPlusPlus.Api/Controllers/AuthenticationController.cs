using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LmsPlusPlus.Api;

[ApiController]
public class AuthenticationController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly IConfiguration _configuration;

    public AuthenticationController(Infrastructure.ApplicationContext context, IConfiguration configuration)
    {
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("sign-in")]
    public async Task<ActionResult<Response.SignIn>> SignIn(Request.SignIn signIn)
    {
        Infrastructure.User? user = await _context.Users
            .SingleOrDefaultAsync(u => u.Login == signIn.Login && u.PasswordHash == signIn.Password);
        if (user is null)
            return BadRequest();
        return new Response.SignIn(CreateJwt(user.Id.ToString(), user.Role.ToString()));
    }

    string CreateJwt(string id, string role)
    {
        string secret = _configuration["JwtSecret"];
        SymmetricSecurityKey key = new(Encoding.Default.GetBytes(secret));
        string issuer = _configuration["JwtIssuer"];
        string audience = _configuration["JwtAudience"];
        Claim[] claims = { new(type: "role", role), new(type: "id", id) };
        SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha256);
        JwtSecurityToken token = new(issuer, audience, claims, notBefore: null, DateTime.UtcNow.AddMinutes(10), credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
