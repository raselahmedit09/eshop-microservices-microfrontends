import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, switchMap } from 'rxjs';
import * as BasketClient from '../api/generated/basket';
import * as CatalogClient from '../api/generated/catalog';
import { AuthService } from '../auth/auth.service';
import { NotificationStore } from './notification.store';

type ShoppingCart = BasketClient.ShoppingCart;
type ShoppingCartItem = BasketClient.ShoppingCartItem;

const EMPTY: ShoppingCart = { userName: '', items: [] };

// A line is one product in one colour, as Shopping.Web lets the user pick a colour
const sameLine = (item: ShoppingCartItem, productId: string, color: string) =>
  item.productId === productId && item.color === color;

// The one basket of the app. Catalog adds to it, basket shows it, the shell shows its count;
// "shared" is a federation singleton, so all three see the same instance.
@Injectable({ providedIn: 'root' })
export class BasketStore {
  private readonly api = inject(BasketClient.BasketService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationStore);

  readonly cart = signal<ShoppingCart>(EMPTY);
  readonly items = computed(() => this.cart().items ?? []);
  readonly count = computed(() => this.items().reduce((sum, i) => sum + (i.quantity ?? 0), 0));
  readonly total = computed(() => this.cart().totalPrice ?? 0);

  load(): void {
    this.api
      .getBasket()
      .pipe(
        map(r => r.cart ?? EMPTY),
        catchError(() => of(EMPTY)), // no basket yet returns 404
      )
      .subscribe(cart => this.cart.set(cart));
  }

  addItem(product: CatalogClient.Product, quantity = 1, color = 'Black'): void {
    if (!this.auth.isLoggedIn()) {
      this.auth.login();
      return;
    }
    const id = product.id ?? '';
    const items = this.items();
    const next = items.some(i => sameLine(i, id, color))
      ? items.map(i => (sameLine(i, id, color) ? { ...i, quantity: (i.quantity ?? 0) + quantity } : i))
      : [...items, { productId: id, productName: product.name, price: product.price, quantity, color }];
    this.save(next, `${product.name} added to your cart.`);
  }

  setQuantity(productId: string, color: string, quantity: number): void {
    const items = this.items();
    const next =
      quantity <= 0
        ? items.filter(i => !sameLine(i, productId, color))
        : items.map(i => (sameLine(i, productId, color) ? { ...i, quantity } : i));
    this.save(next);
  }

  clear(): void {
    this.cart.set(EMPTY);
  }

  private save(items: ShoppingCartItem[], message?: string): void {
    // Store, then read back: the server applies discounts (gRPC) and calculates the total.
    // userName is ignored by the API, which takes the user from the token.
    this.api
      .storeBasket({ cart: { userName: '', items } })
      .pipe(
        switchMap(() => this.api.getBasket()),
        map(r => r.cart ?? EMPTY),
      )
      .subscribe({
        next: cart => {
          this.cart.set(cart);
          if (message) {
            this.notify.success(message);
          }
        },
        error: () => undefined, // errorInterceptor already showed the message
      });
  }
}
