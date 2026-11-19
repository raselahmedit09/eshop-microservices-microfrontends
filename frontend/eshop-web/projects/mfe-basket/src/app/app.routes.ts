import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/cart".
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/basket-home/basket-home').then(m => m.BasketHome),
  },
];
