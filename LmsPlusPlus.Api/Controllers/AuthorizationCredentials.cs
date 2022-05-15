using System.Security.Claims;

namespace LmsPlusPlus.Api;

class AuthorizationCredentials
{
    internal Infrastructure.Role UserRole { get; }
    internal long UserId { get; set; }

    internal AuthorizationCredentials(ClaimsPrincipal claimsPrincipal)
    {
        Claim claim = claimsPrincipal.FindFirst(ClaimTypes.Role)!;
        UserRole = Enum.Parse<Infrastructure.Role>(claim.Value);
        claim = claimsPrincipal.FindFirst("id")!;
        UserId = long.Parse(claim.Value);
    }
}
