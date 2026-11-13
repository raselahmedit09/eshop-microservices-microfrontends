using System.Security.Claims;
using Ordering.Application.Orders.Queries.GetOrdersByCustomer;

namespace Ordering.API.Endpoints
{
    // The signed-in customer's own orders. The customer id is the token's "sub", never a URL value.
    public class GetMyOrders : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // "/orders/me" is a literal segment, so routing prefers it over "/orders/{orderName}"
            app.MapGet("/orders/me", async (ClaimsPrincipal user, ISender sender) =>
            {
                var customerId = Guid.Parse(user.GetUserId());

                var result = await sender.Send(new GetOrdersByCustomerQuery(customerId));

                var response = result.Adapt<GetOrdersByCustomerResponse>();

                return Results.Ok(response);
            })
            .WithName("GetMyOrders")
            .Produces<GetOrdersByCustomerResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Get My Orders")
            .WithDescription("Orders of the signed-in customer")
            .RequireAuthorization(AuthPolicies.OrdersRead);
        }
    }
}
