import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BasketClient, BasketStore } from 'shared';

// Shopping.Web's Cart: lines, quantity +/-, remove, total, continue shopping, checkout
@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  protected readonly store = inject(BasketStore);

  constructor() {
    // Fresh prices and discounts from the server every time the page opens
    this.store.load();
  }

  change(item: BasketClient.ShoppingCartItem, quantity: number): void {
    this.store.setQuantity(item.productId ?? '', item.color ?? '', quantity);
  }

  // Price after the per-unit discount from the Discount service (gRPC), for the whole line
  lineTotal(item: BasketClient.ShoppingCartItem): number {
    return (item.discountedPrice ?? item.price ?? 0) * (item.quantity ?? 0);
  }

  lineBeforeDiscount(item: BasketClient.ShoppingCartItem): number {
    return (item.price ?? 0) * (item.quantity ?? 0);
  }
}
