using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Domain.Events;

namespace Ordering.Application.Orders.EventHandlers.Domain
{
    // Place for follow-up work when an order is cancelled: refund, releasing stock, emailing the customer.
    internal class OrderCancelledEventHandler(ILogger<OrderCancelledEventHandler> logger) : INotificationHandler<OrderCancelledEvent>
    {
        public Task Handle(OrderCancelledEvent notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Domain Event handled: {DomainEvent} for order {OrderId}",
                notification.GetType().Name, notification.order.Id.Value);
            return Task.CompletedTask;
        }
    }
}
