using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace LmsPlusPlus.Api;

public class JwtGenerator
{
    readonly string _secret;
    readonly string _issuer;
    readonly string _audience;

    public JwtGenerator(IConfiguration configuration)
    {
        _secret = configuration["JwtSecret"];
        _issuer = configuration["JwtIssuer"];
        _audience = configuration["JwtAudience"];
    }

    internal string Generate(string userId, string userRole)
    {
        SymmetricSecurityKey key = new(Encoding.Default.GetBytes(_secret));
        Claim[] claims = { new(type: "role", userRole), new(type: "id", userId) };
        SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha256);
        JwtSecurityToken token = new(_issuer, _audience, claims, notBefore: null, DateTime.UtcNow.AddHours(1), credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
