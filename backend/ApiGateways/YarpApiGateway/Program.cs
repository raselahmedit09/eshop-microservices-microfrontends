using BuildingBlocks.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Same token validation as BuildingBlocks' AddEshopAuthentication. The gateway does not reference
// BuildingBlocks (its Dockerfile copies only this project), so the few lines are repeated here.
var keycloak = builder.Configuration.GetSection("Keycloak");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloak["Authority"];
        options.Audience = keycloak["Audience"];

        // Inside containers keys are fetched from keycloak:8080 while the issuer stays localhost:8180 
        var metadata = keycloak["MetadataAddress"];
        if (!string.IsNullOrEmpty(metadata))
        {
            options.MetadataAddress = metadata;
        }

        options.RequireHttpsMetadata = keycloak.GetValue("RequireHttpsMetadata", true);
        options.MapInboundClaims = false;
        options.TokenValidationParameters.RoleClaimType = "roles";
    });

// Route policies used in appsettings ReverseProxy:Routes. "default" (any signed-in user) and
// "anonymous" (no login) are built into YARP. A route without a policy falls back to a signed-in user.
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
    .AddPolicy(AuthPolicies.Admin, policy => policy.RequireRole("Admin"));

// The Angular app runs on another origin (localhost:4200), so the browser needs CORS permission
builder.Services.AddCors(options => options.AddPolicy("spa", policy => policy
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    rateLimiterOptions.AddFixedWindowLimiter("fixed", options =>
    {
        options.Window = TimeSpan.FromSeconds(10);
        options.PermitLimit = 5;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

// CORS first, so the browser's preflight (OPTIONS) request is answered before authentication
app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapReverseProxy();

app.Run();
