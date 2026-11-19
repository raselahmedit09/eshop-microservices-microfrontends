using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;

namespace BuildingBlocks.OpenApi
{
    public static class OpenApiExtensions
    {
        // OpenAPI document used by the Angular client generator (frontend: npm run generate:api)
        public static IServiceCollection AddEshopOpenApi(this IServiceCollection services)
        {
            // OpenAPI 3.0: .NET 10 defaults to 3.1, which code generators do not fully support yet.
            // Build-time generation also needs <OpenApiGenerateDocumentsOptions> in the csproj.
            services.AddOpenApi(options => options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0);

            // The web default also accepts numbers sent as strings ("12.5"), so every number is
            // described as "number or string" and the generator turns it into an empty type.
            // Strict: a number is a number, in the API and in the document.
            services.ConfigureHttpJsonOptions(options =>
                options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);

            return services;
        }
    }
}
