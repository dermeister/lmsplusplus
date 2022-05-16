using System.Security.Claims;

namespace LmsPlusPlus.Api;

readonly struct AuthorizationCredentials
{
    internal Infrastructure.Role UserRole { get; }
    internal long UserId { get; }

    internal AuthorizationCredentials(ClaimsPrincipal claimsPrincipal)
    {
        Claim claim = claimsPrincipal.FindFirst(ClaimTypes.Role)!;
        UserRole = Enum.Parse<Infrastructure.Role>(claim.Value);
        claim = claimsPrincipal.FindFirst("id")!;
        UserId = long.Parse(claim.Value);
    }
}
