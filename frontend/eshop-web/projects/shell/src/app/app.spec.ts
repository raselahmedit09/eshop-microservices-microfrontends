import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from 'shared';
import { App } from './app';

// Stand-in for AuthService so the test needs no Keycloak
class FakeAuth {
  readonly isLoggedIn = signal(false);
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

  const links = (el: HTMLElement) => Array.from(el.querySelectorAll('nav a')).map(a => a.getAttribute('href'));

  it('shows only the catalog and a login button when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(links(el)).toEqual(['/']);
    el.querySelector<HTMLButtonElement>('.account button')!.click();
    expect(auth.login).toHaveBeenCalled();
  });

  it('shows cart, orders and the user name when signed in', async () => {
    auth.isLoggedIn.set(true);
    auth.displayName.set('Rasel');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(links(el)).toEqual(['/', '/cart', '/orders']);
    expect(el.querySelector('.account')?.textContent).toContain('Rasel');
  });
});
