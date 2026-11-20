import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, take, timer } from 'rxjs';
import { NotificationStore, ORDER_STATUS_NAME, OrderingClient, OrderStatus } from 'shared';

type Order = OrderingClient.OrderDto;

// Shopping.Web's OrderList, plus cancelling a pending order (POST /orders/me/{id}/cancel)
@Component({
  selector: 'app-order-list',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderList {
  private readonly api = inject(OrderingClient.OrdersService);
  private readonly notify = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusName = ORDER_STATUS_NAME;
  protected readonly orders = signal<Order[]>([]);
  protected readonly loaded = signal(false);
  // The order whose "Cancel?" question is open, and the one being cancelled right now
  protected readonly confirming = signal<string | null>(null);
  protected readonly cancelling = signal<string | null>(null);
  protected readonly justPlaced = inject(ActivatedRoute).snapshot.queryParamMap.has('placed');

  constructor() {
    // Checkout creates the order asynchronously (RabbitMQ). Coming from Confirmation, load 4 times
    // 2.5 s apart, which stays under the gateway's limit of 5 requests per 10 s for ordering.
    this.load(this.justPlaced ? 4 : 1);
  }

  canCancel(order: Order): boolean {
    return order.status === OrderStatus.Pending;
  }

  badgeClass(order: Order): string {
    if (order.status === OrderStatus.Pending) return 'badge text-bg-warning';
    if (order.status === OrderStatus.Completed) return 'badge text-bg-success';
    return 'badge text-bg-secondary';
  }

  total(order: Order): number {
    return order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  cancel(order: Order): void {
    this.confirming.set(null);
    this.cancelling.set(order.id);
    this.api.cancelMyOrder(order.id).subscribe({
      next: () => {
        this.notify.success(`Order ${order.orderName} was cancelled.`);
        this.cancelling.set(null);
        this.load(1);
      },
      // errorInterceptor already showed the reason, e.g. "Order is Completed and can no longer be cancelled."
      error: () => this.cancelling.set(null),
    });
  }

  private load(attempts: number): void {
    timer(0, 2500)
      .pipe(
        take(attempts),
        switchMap(() => this.api.getMyOrders()),
        map(r => r.orders ?? []),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: orders => {
          this.orders.set(orders);
          this.loaded.set(true);
        },
        error: () => this.loaded.set(true),
      });
  }
}
