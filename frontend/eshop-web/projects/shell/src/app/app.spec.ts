import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, BasketStore, NotificationStore } from 'shared';
import { App } from './app';

// Stand-ins so the test needs no Keycloak and no gateway
class FakeAuth {
  readonly isLoggedIn = signal(false);
  readonly isAdmin = signal(false);
  readonly displayName = signal('');
  login = vi.fn();
  logout = vi.fn();
}

class FakeBasket {
  readonly count = signal(0);
  load = vi.fn();
  clear = vi.fn();
}

describe('App', () => {
  let auth: FakeAuth;
  let basket: FakeBasket;

  beforeEach(async () => {
    auth = new FakeAuth();
    basket = new FakeBasket();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: BasketStore, useValue: basket },
      ],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const links = (el: HTMLElement) => Array.from(el.querySelectorAll('nav a')).map(a => a.getAttribute('href'));

  it('shows home, products and a login button when signed out', async () => {
    const el = await render();

    expect(links(el)).toEqual(['/', '/products', '/contact']);
    expect(basket.clear).toHaveBeenCalled();
    el.querySelector<HTMLButtonElement>('.account button')!.click();
    expect(auth.login).toHaveBeenCalled();
  });

  it('loads the basket and shows orders, the cart count and the name for a customer', async () => {
    auth.isLoggedIn.set(true);
    auth.displayName.set('customer');
    basket.count.set(3);
    const el = await render();

    expect(links(el)).toEqual(['/', '/products', '/orders', '/contact']);
    expect(basket.load).toHaveBeenCalled();
    expect(el.querySelector('.account .badge')?.textContent).toBe('3');
    expect(el.querySelector('.account')?.textContent).toContain('customer');
  });

  it('shows the admin link for an admin', async () => {
    auth.isLoggedIn.set(true);
    auth.isAdmin.set(true);
    const el = await render();

    expect(links(el)).toEqual(['/', '/products', '/orders', '/contact', '/admin']);
  });

  it('shows messages pushed by any app', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(NotificationStore).success('Phone added to your cart.');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.toast-stack')?.textContent).toContain(
      'Phone added to your cart.',
    );
  });
});
