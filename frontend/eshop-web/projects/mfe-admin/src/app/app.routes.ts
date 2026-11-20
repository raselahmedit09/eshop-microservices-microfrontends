import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/admin",
// behind authGuard and adminGuard.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/product-admin/product-admin').then(m => m.ProductAdmin),
  },
];
