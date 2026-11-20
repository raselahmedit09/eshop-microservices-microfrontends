import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, BasketStore, NotificationStore } from 'shared';

// The shell owns only the layout, navigation, login and messages; every page comes from a remote
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly basket = inject(BasketStore);
  protected readonly notify = inject(NotificationStore);

  constructor() {
    // Load the user's basket after login (so the header count is right), empty it after logout
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      untracked(() => (loggedIn ? this.basket.load() : this.basket.clear()));
    });
  }
}
