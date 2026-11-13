using BuildingBlocks.Exceptions;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Data;
using Ordering.Application.Exceptions;
using Ordering.Domain.ValueObjects;

namespace Ordering.Application.Orders.Commands.CancelMyOrder
{
    public class CancelMyOrderHandler(IApplicationDbContext dbContext) : ICommandHandler<CancelMyOrderCommand, CancelMyOrderResult>
    {
        public async Task<CancelMyOrderResult> Handle(CancelMyOrderCommand command, CancellationToken cancellationToken)
        {
            var orderId = OrderId.Of(command.OrderId);
            var customerId = CustomerId.Of(command.CustomerId);

            // Look the order up by id AND owner. Another customer's order gives the same 404 as a missing one,
            // so nobody can find out which order ids exist.
            var order = await dbContext.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == customerId, cancellationToken);

            if (order is null)
            {
                throw new OrderNotFoundException(command.OrderId);
            }

            // Checked here as well as in Order.Cancel() so the customer gets a 400 with a clear message
            // instead of a 500 from the domain exception
            if (!order.CanBeCancelled)
            {
                throw new BadRequestException($"Order is {order.Status} and can no longer be cancelled.");
            }

            order.Cancel();
            await dbContext.SaveChangesAsync(cancellationToken);

            return new CancelMyOrderResult(true);
        }
    }
}
