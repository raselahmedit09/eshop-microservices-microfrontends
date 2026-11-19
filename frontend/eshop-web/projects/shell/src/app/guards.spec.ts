import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { adminGuard, AuthService, authGuard } from 'shared';

// The guards live in "shared"; they are tested here because the shared library has no test setup of its own yet
class FakeAuth {
  readonly isLoggedIn = signal(false);
  readonly isAdmin = signal(false);
  login = vi.fn();
}

describe('guards', () => {
  let auth: FakeAuth;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    auth = new FakeAuth();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  const run = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard(route, state));

  it('authGuard sends a signed-out user to the login page', () => {
    expect(run(authGuard)).toBe(false);
    expect(auth.login).toHaveBeenCalled();
  });

  it('authGuard lets a signed-in user through', () => {
    auth.isLoggedIn.set(true);
    expect(run(authGuard)).toBe(true);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('adminGuard sends a non-admin home', () => {
    auth.isLoggedIn.set(true);
    const result = run(adminGuard);
    expect(result instanceof UrlTree && result.toString()).toBe('/');
  });

  it('adminGuard lets an admin through', () => {
    auth.isAdmin.set(true);
    expect(run(adminGuard)).toBe(true);
  });
});
