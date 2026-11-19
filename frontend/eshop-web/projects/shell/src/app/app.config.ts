import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor } from 'angular-auth-oidc-client';
import { provideApiClients, provideEshopAuth } from 'shared';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Adds "Authorization: Bearer <token>" to calls whose URL starts with a secureRoutes entry (the gateway)
    provideHttpClient(withInterceptors([authInterceptor()])),
    // Login with Keycloak. Only the shell provides it; remotes reach the same instance through AuthService.
    provideEshopAuth(),
    // Generated API clients, pointed at the gateway. Provided once in the shell; remotes inject
    // the same instances because "shared" is a federation singleton.
    provideApiClients(),
  ],
};
