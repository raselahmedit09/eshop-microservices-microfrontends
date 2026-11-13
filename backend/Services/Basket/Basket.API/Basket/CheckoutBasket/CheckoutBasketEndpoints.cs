using System.Security.Claims;
using Basket.API.Dtos;
using Mapster;
using MediatR;

namespace Basket.API.Basket.CheckoutBasket
{
    public record CheckoutBasketRequest(BasketCheckoutDto BasketCheckoutDto);
    public record CheckoutBasketResponse(bool IsSuccess);
    public class CheckoutBasketEndpoints : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/basket/checkout", async (CheckoutBasketRequest request, ClaimsPrincipal user, ISender sender) =>
            {
                // The basket key and Ordering's CustomerId are both the token's "sub" (a GUID in Keycloak)
                var userId = user.GetUserId();
                request.BasketCheckoutDto.UserName = userId;
                request.BasketCheckoutDto.CustomerId = Guid.Parse(userId);

                var command = request.Adapt<CheckoutBasketCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<CheckoutBasketResponse>();

                return Results.Ok(response);
            })
        .WithName("CheckoutBasket")
        .Produces<CheckoutBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Checkout Basket")
        .WithDescription("Checkout Basket")
        .RequireAuthorization(AuthPolicies.Basket);
        }
    }
}
