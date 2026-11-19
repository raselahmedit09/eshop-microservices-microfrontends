import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/orders".
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/orders-home/orders-home').then(m => m.OrdersHome),
  },
];
