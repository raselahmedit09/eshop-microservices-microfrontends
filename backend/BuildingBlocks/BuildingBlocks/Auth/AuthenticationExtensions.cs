using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Auth
{
    public static class AuthenticationExtensions
    {
        public static IServiceCollection AddEshopAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var settings = configuration.GetSection("Keycloak");

            // Validates signature (keys from Keycloak), issuer, audience (eshop-api) and lifetime
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    // Must equal the "iss" in the token, e.g. http://localhost:8180/realms/eshop
                    options.Authority = settings["Authority"];
                    options.Audience = settings["Audience"];

                    // Inside containers keys are fetched from keycloak:8080 while the issuer stays localhost:8180 (B7)
                    var metadata = settings["MetadataAddress"];
                    if (!string.IsNullOrEmpty(metadata))
                    {
                        options.MetadataAddress = metadata;
                    }

                    // false only for the local http Keycloak; production uses https
                    options.RequireHttpsMetadata = settings.GetValue("RequireHttpsMetadata", true);

                    // Keep claim names exactly as in the token: sub, scope, roles, preferred_username
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters.RoleClaimType = "roles";
                    options.TokenValidationParameters.NameClaimType = "preferred_username";
                });

            services.AddAuthorizationBuilder()
                .AddPolicy(AuthPolicies.Basket, policy => policy.RequireAssertion(c => c.User.HasScope("Basket.ReadWrite")))
                .AddPolicy(AuthPolicies.Orders, policy => policy.RequireAssertion(c => c.User.HasScope("Orders.Read")))
                .AddPolicy(AuthPolicies.Admin, policy => policy.RequireRole("Admin"));

            return services;
        }
    }
}
