import { EnvironmentProviders } from '@angular/core';
import { LogLevel, provideAuth, withAppInitializerAuthCheck } from 'angular-auth-oidc-client';
import { API_BASE, OIDC } from '../config';

// The single OIDC client of the app. Only the shell calls this; remotes read state through AuthService.
export function provideEshopAuth(): EnvironmentProviders {
  return provideAuth(
    {
      config: {
        authority: OIDC.authority,
        clientId: OIDC.clientId,
        scope: OIDC.scope,
        responseType: 'code', // Authorization Code + PKCE
        // Trailing slash so it matches the client's "http://localhost:4200/*" redirect URI in Keycloak
        redirectUrl: `${window.location.origin}/`,
        postLogoutRedirectUri: `${window.location.origin}/`,
        silentRenew: true,
        useRefreshToken: true, // renews with offline_access, no hidden iframe
        autoUserInfo: false, // name and roles come from the id token
        secureRoutes: [`${API_BASE}/`], // the interceptor adds the token only to gateway calls
        logLevel: LogLevel.Warn,
      },
    },
    // Reads ?code=... and gets the tokens before the router's first navigation
    withAppInitializerAuthCheck(),
  );
}
