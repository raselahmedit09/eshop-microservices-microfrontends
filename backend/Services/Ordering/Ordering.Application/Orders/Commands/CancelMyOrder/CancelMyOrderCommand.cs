namespace Ordering.Application.Orders.Commands.CancelMyOrder
{
    // CustomerId is the signed-in user (token "sub"), set by the endpoint, never taken from the request body
    public record CancelMyOrderCommand(Guid OrderId, Guid CustomerId) : ICommand<CancelMyOrderResult>;

    public record CancelMyOrderResult(bool IsSuccess);

    public class CancelMyOrderCommandValidator : AbstractValidator<CancelMyOrderCommand>
    {
        public CancelMyOrderCommandValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId is required");
            RuleFor(x => x.CustomerId).NotEmpty().WithMessage("CustomerId is required");
        }
    }
}
