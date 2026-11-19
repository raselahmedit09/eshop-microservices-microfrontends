import { computed, inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

// Id token claims the app reads (Keycloak puts realm roles in "roles")
interface EshopClaims {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  roles?: string[];
}

// Pages and remotes depend on this service only, never on the OIDC library, so the login
// mechanism (for example a BFF later) can change here without touching them.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);

  private readonly claims = computed<EshopClaims>(() => this.oidc.userData().userData ?? {});

  readonly isLoggedIn = computed(() => this.oidc.authenticated().isAuthenticated);
  readonly userId = computed(() => this.claims().sub ?? '');
  readonly displayName = computed(() => this.claims().name || this.claims().preferred_username || '');
  readonly email = computed(() => this.claims().email ?? '');
  readonly isAdmin = computed(() => (this.claims().roles ?? []).includes('Admin'));

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    this.oidc.logoff().subscribe();
  }
}
