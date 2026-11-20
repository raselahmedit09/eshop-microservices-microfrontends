import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService, BasketClient, BasketStore, CatalogClient, NotificationStore } from 'shared';

// BasketStore lives in "shared"; tested here because the shared library has no test setup of its own yet.
// The fake API stores the cart and returns it on the next getBasket, like Basket.API.
class FakeBasketApi {
  stored: BasketClient.ShoppingCart = { items: [] };
  getBasket = vi.fn(() => of({ cart: this.stored }));
  storeBasket = vi.fn((req: BasketClient.StoreBasketRequest) => {
    this.stored = req.cart;
    return of({ userName: 'u' });
  });
}

describe('BasketStore', () => {
  let api: FakeBasketApi;
  let store: BasketStore;
  const loggedIn = signal(true);
  const login = vi.fn();
  const phone: CatalogClient.Product = { id: 'p1', name: 'Phone', price: 100, category: [], description: '', imageFile: '' };

  beforeEach(() => {
    api = new FakeBasketApi();
    loggedIn.set(true);
    login.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: BasketClient.BasketService, useValue: api },
        { provide: AuthService, useValue: { isLoggedIn: loggedIn, login } },
      ],
    });
    store = TestBed.inject(BasketStore);
  });

  it('sends a signed-out user to login instead of adding', () => {
    loggedIn.set(false);
    store.addItem(phone);

    expect(login).toHaveBeenCalled();
    expect(api.storeBasket).not.toHaveBeenCalled();
  });

  it('adds the same product and colour to one line and counts the quantity', () => {
    store.addItem(phone, 1, 'Black');
    store.addItem(phone, 2, 'Black');

    expect(store.items()).toEqual([expect.objectContaining({ productId: 'p1', color: 'Black', quantity: 3 })]);
    expect(store.count()).toBe(3);
  });

  it('keeps another colour on its own line', () => {
    store.addItem(phone, 1, 'Black');
    store.addItem(phone, 1, 'Red');

    expect(store.items().length).toBe(2);
  });

  it('removes a line when its quantity is set to 0', () => {
    store.addItem(phone, 2, 'Black');
    store.setQuantity('p1', 'Black', 0);

    expect(store.items()).toEqual([]);
  });

  it('shows a message after adding', () => {
    store.addItem(phone);

    expect(TestBed.inject(NotificationStore).toasts()[0]?.text).toBe('Phone added to your cart.');
  });
});
