import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/cart".
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/cart/cart').then(m => m.Cart) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout) },
];
