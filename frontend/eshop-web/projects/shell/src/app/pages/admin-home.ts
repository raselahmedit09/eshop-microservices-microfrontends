import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from 'shared';

// Placeholder until the admin remote (mfe-admin) exists; then the route loads that remote instead
@Component({
  selector: 'app-admin-home',
  template: `
    <h1>Admin area</h1>
    <p>Signed in as {{ auth.displayName() }} with the Admin role.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHome {
  protected readonly auth = inject(AuthService);
}
