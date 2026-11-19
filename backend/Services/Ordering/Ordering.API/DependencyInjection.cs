using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions.Handler;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using BuildingBlocks.OpenApi;

namespace Ordering.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddCarter();

            // Validates Keycloak access tokens and registers the shared Basket/Orders/Admin policies.
            services.AddEshopAuthentication(configuration);

            services.AddExceptionHandler<CustomExceptionHandler>();
            services.AddHealthChecks()
                .AddSqlServer(configuration.GetConnectionString("Database"));

            // OpenAPI 3.0 document with plain number types, for the Angular client generator
            services.AddEshopOpenApi();

            return services;
        }

        public static WebApplication UseApiServices(this WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapCarter();

            // GET /openapi/v1.json, only in Development. AllowAnonymous because of the fallback policy
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi().AllowAnonymous();
            }

            app.UseExceptionHandler(options => { });
            // An endpoint (not UseHealthChecks middleware) so AllowAnonymous exempts it from the fallback policy
            app.MapHealthChecks("/health",
               new HealthCheckOptions
               {
                   ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
               }).AllowAnonymous();

            return app;
        }
    }
}
