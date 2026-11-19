import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from 'shared';
import { App } from './app';

// Stand-in for AuthService so the test needs no Keycloak
class FakeAuth {
  readonly isLoggedIn = signal(false);
  readonly isAdmin = signal(false);
  readonly displayName = signal('');
  login = vi.fn();
  logout = vi.fn();
}

describe('App', () => {
  let auth: FakeAuth;

  beforeEach(async () => {
    auth = new FakeAuth();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const links = (el: HTMLElement) => Array.from(el.querySelectorAll('nav a')).map(a => a.getAttribute('href'));

  it('shows only home and a login button when signed out', async () => {
    const el = await render();

    expect(links(el)).toEqual(['/']);
    el.querySelector<HTMLButtonElement>('.account button')!.click();
    expect(auth.login).toHaveBeenCalled();
  });

  it('shows cart, orders and the user name for a customer, but no admin link', async () => {
    auth.isLoggedIn.set(true);
    auth.displayName.set('customer');
    const el = await render();

    expect(links(el)).toEqual(['/', '/cart', '/orders']);
    expect(el.querySelector('.account')?.textContent).toContain('customer');
  });

  it('shows the admin link for an admin', async () => {
    auth.isLoggedIn.set(true);
    auth.isAdmin.set(true);
    const el = await render();

    expect(links(el)).toEqual(['/', '/cart', '/orders', '/admin']);
  });
});
