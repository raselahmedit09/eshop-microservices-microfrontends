using System.Security.Claims;

namespace BuildingBlocks.Auth
{
    public static class ClaimsPrincipalExtensions
    {
        // The user's permanent id (a GUID in Keycloak). Username and email can change, this cannot.
        public static string GetUserId(this ClaimsPrincipal user) =>
            user.FindFirst("sub")?.Value
            ?? throw new InvalidOperationException("The token has no sub claim.");

        // Scopes arrive as one space-separated string: "openid Basket.ReadWrite Orders.Read"
        public static bool HasScope(this ClaimsPrincipal user, string scope) =>
            user.FindAll("scope")
                .SelectMany(c => c.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                .Contains(scope);
    }
}
