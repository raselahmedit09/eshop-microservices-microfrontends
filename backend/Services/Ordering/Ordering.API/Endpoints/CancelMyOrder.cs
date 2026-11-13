using System.Security.Claims;
using Ordering.Application.Orders.Commands.CancelMyOrder;

namespace Ordering.API.Endpoints
{
    public record CancelMyOrderResponse(bool IsSuccess);

    // The signed-in customer cancels one of their own orders. Cancel changes the status, it does not delete,
    // so it is a POST action rather than DELETE.
    public class CancelMyOrder : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/orders/me/{id:guid}/cancel", async (Guid id, ClaimsPrincipal user, ISender sender) =>
            {
                var customerId = Guid.Parse(user.GetUserId());

                var result = await sender.Send(new CancelMyOrderCommand(id, customerId));

                var response = result.Adapt<CancelMyOrderResponse>();

                return Results.Ok(response);
            })
            .WithName("CancelMyOrder")
            .Produces<CancelMyOrderResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Cancel My Order")
            .WithDescription("Cancels a pending order of the signed-in customer")
            .RequireAuthorization(AuthPolicies.OrdersWrite);
        }
    }
}
