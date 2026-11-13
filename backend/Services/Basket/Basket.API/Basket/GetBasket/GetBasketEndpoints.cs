using System.Security.Claims;
using Mapster;
using MediatR;

namespace Basket.API.Basket.GetBasket
{
    public record GetBasketResponse(ShoppingCart Cart);

    public class GetBasketEndpoints : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // The basket owner comes from the token ("sub"), never from the URL, so nobody can read another user's basket
            app.MapGet("/basket", async (ClaimsPrincipal user, ISender sender) =>
            {
                var result = await sender.Send(new GetBasketQuery(user.GetUserId()));

                var respose = result.Adapt<GetBasketResponse>();

                return Results.Ok(respose);
            })
        .WithName("GetBasket")
        .Produces<GetBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Get Basket")
        .WithDescription("Get Basket")
        .RequireAuthorization(AuthPolicies.Basket);
        }
    }
}
