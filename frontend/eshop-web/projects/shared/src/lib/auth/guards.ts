import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Not signed in: go to the Keycloak login page, which returns to the app afterwards
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) {
    return true;
  }
  auth.login();
  return false;
};

// Hiding admin pages is only a convenience; the real check is the backend's Admin policy
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin() || inject(Router).parseUrl('/');
