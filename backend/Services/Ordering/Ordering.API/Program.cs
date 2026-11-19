using Microsoft.OpenApi;
using Ordering.API;
using Ordering.Application;
using Ordering.Infrastructure;
using Ordering.Infrastructure.Data.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services
    .AddApiServices(builder.Configuration)
    .AddApplicationServices(builder.Configuration)
    .AddInfrastructureServices(builder.Configuration);



// OpenAPI 3.0: .NET 10 defaults to 3.1, which code generators do not fully support yet
builder.Services.AddOpenApi(options => options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0);


var app = builder.Build();


// configure the HTTP request pipeline
app.UseApiServices();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // GET /openapi/v1.json, only in Development so production does not publish its API description
    await app.InitialiseDatabaseAsync();
}

app.Run();
