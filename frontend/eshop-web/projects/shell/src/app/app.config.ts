import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideApiClients } from 'shared';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The auth interceptor (Phase 4) is added here later via withInterceptors
    provideHttpClient(),
    // Generated API clients, pointed at the gateway. Provided once in the shell; remotes inject
    // the same instances because "shared" is a federation singleton.
    provideApiClients(),
  ],
};
