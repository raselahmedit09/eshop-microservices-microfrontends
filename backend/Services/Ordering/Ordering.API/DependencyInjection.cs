using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions.Handler;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

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

            return services;
        }

        public static WebApplication UseApiServices(this WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapCarter();

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
