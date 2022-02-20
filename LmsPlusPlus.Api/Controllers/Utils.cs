using System.Security.Claims;

namespace LmsPlusPlus.Api;

static class Utils
{
    internal static long GetUserIdFromClaims(ClaimsPrincipal claimsPrincipal)
    {
        Claim claim = claimsPrincipal.FindFirst("id")!;
        return long.Parse(claim.Value);
    }

    internal static Infrastructure.Role GetUserRoleFromClaims(ClaimsPrincipal claimsPrincipal)
    {
        Claim claim = claimsPrincipal.FindFirst(ClaimTypes.Role)!;
        return Enum.Parse<Infrastructure.Role>(claim.Value);
    }
}
